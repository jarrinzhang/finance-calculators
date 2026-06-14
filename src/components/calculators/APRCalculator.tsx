/**
 * APRCalculator - 真实年化利率计算器
 *
 * 输入：贷款额、费用、名义利率、年限
 * 输出：含费后真实 APR、月供、实到金额、对比展示
 */
import { useMemo, useState } from "react";
import {
  calculateAPR,
  formatCurrency,
  parseNumberInput,
} from "../../lib/finance";
import {
  CalculatorShell,
  InputPanel,
  ResultPanel,
  NumberField,
  ResultCard,
  ResultRow,
} from "./ui";

export default function APRCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [fees, setFees] = useState("500");
  const [rate, setRate] = useState("6");
  const [years, setYears] = useState("5");

  const result = useMemo(() => {
    return calculateAPR(
      parseNumberInput(principal),
      parseNumberInput(fees),
      parseNumberInput(rate),
      parseNumberInput(years)
    );
  }, [principal, fees, rate, years]);

  const aprDifference = result.aprPercent - parseNumberInput(rate);

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="apr-principal"
          label="Loan Amount"
          prefix="$"
          value={principal}
          onChange={setPrincipal}
          step="500"
        />
        <NumberField
          id="apr-fees"
          label="Upfront Fees"
          prefix="$"
          value={fees}
          onChange={setFees}
          step="50"
          hint="Origination fees, points, broker fees, etc."
        />
        <NumberField
          id="apr-rate"
          label="Stated Interest Rate"
          suffix="%"
          value={rate}
          onChange={setRate}
          step="0.1"
        />
        <NumberField
          id="apr-years"
          label="Loan Term"
          suffix="years"
          value={years}
          onChange={setYears}
          step="1"
        />
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="True APR (incl. fees)"
          value={`${result.aprPercent.toFixed(3)}%`}
          subtext={`${aprDifference >= 0 ? "+" : ""}${aprDifference.toFixed(3)}% vs. stated rate`}
          accent="bg-gradient-to-br from-violet-600 to-violet-800"
        />
        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow
            label="Loan Amount"
            value={formatCurrency(parseNumberInput(principal))}
          />
          <ResultRow
            label="Cash You Receive"
            value={formatCurrency(result.netAmount)}
          />
          <ResultRow
            label="Monthly Payment"
            value={formatCurrency(result.monthlyPayment)}
          />
          <ResultRow
            label="Total Interest + Fees"
            value={formatCurrency(
              result.monthlyPayment * parseNumberInput(years) * 12 - result.netAmount
            )}
            emphasis
          />
        </div>

        {/* APR vs 名义利率解读 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Stated rate: {parseNumberInput(rate).toFixed(2)}%</span>
            <span>True APR: {result.aprPercent.toFixed(2)}%</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-gray-400"
              style={{ width: `${(parseNumberInput(rate) / result.aprPercent) * 100}%` }}
              title="Stated rate"
            />
            <div
              className="h-full bg-violet-500"
              style={{ width: `${(aprDifference / result.aprPercent) * 100}%` }}
              title="Fees impact"
            />
          </div>
          <p className="text-xs text-gray-500">
            Fees push your true cost of borrowing{" "}
            <strong>{aprDifference.toFixed(2)}% higher</strong> than the advertised rate.
            Always compare APRs across lenders — not just interest rates.
          </p>
        </div>
      </ResultPanel>
    </CalculatorShell>
  );
}
