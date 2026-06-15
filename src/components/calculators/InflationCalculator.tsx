/**
 * InflationCalculator - 通胀计算器
 *
 * 输入：今天金额、年通胀率、年数
 * 输出：未来等价金额 + 今天 $1 的购买力变化
 */
import { useMemo, useState } from "react";
import {
  calculateInflation,
  formatCurrency,
  parseNumberInput,
} from "../../lib/finance";
import {
  CalculatorShell,
  InputPanel,
  ResultPanel,
  NumberField,
  RangeField,
  ResultCard,
  ResultRow,
} from "./ui";

export default function InflationCalculator() {
  const [amount, setAmount] = useState("10000");
  const [rate, setRate] = useState("3");
  const [years, setYears] = useState(20);

  const result = useMemo(() => {
    return calculateInflation(
      parseNumberInput(amount),
      parseNumberInput(rate),
      years
    );
  }, [amount, rate, years]);

  // 购买力损失的百分比
  const purchasingPowerLossPct =
    parseNumberInput(amount) > 0
      ? (1 - result.purchasingPower / parseNumberInput(amount)) * 100
      : 0;

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="infl-amount"
          label="Today's Amount"
          prefix="$"
          value={amount}
          onChange={setAmount}
          step="500"
        />
        <NumberField
          id="infl-rate"
          label="Annual Inflation Rate"
          suffix="%"
          value={rate}
          onChange={setRate}
          step="0.1"
          hint="U.S. historical average: ~3% per year"
        />
        <RangeField
          id="infl-years"
          label="Years from Now"
          value={years}
          min={1}
          max={50}
          step={1}
          onChange={setYears}
          formatValue={(v) => `${v} ${v === 1 ? "year" : "years"}`}
        />
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Equivalent Amount in the Future"
          value={formatCurrency(result.futureValue)}
          subtext={`To match today's ${formatCurrency(parseNumberInput(amount))} in ${years} years`}
          accent="bg-gradient-to-br from-rose-600 to-rose-800"
        />

        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow
            label="Today's Amount"
            value={formatCurrency(parseNumberInput(amount))}
          />
          <ResultRow
            label={`Equivalent in ${years} years`}
            value={formatCurrency(result.futureValue)}
          />
          <ResultRow
            label="Purchasing power loss"
            value={formatCurrency(result.totalInflation)}
          />
          <ResultRow
            label={`Today's $1 buys in ${years} yrs`}
            value={formatCurrency(result.purchasingPower / parseNumberInput(amount) || 0, "USD", 2)}
            emphasis
          />
        </div>

        {/* 购买力损失可视化 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Purchasing power lost</span>
            <span>{purchasingPowerLossPct.toFixed(1)}%</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-rose-500"
              style={{ width: `${purchasingPowerLossPct}%` }}
              title="Lost to inflation"
            />
            <div
              className="h-full bg-emerald-500"
              style={{ width: `${100 - purchasingPowerLossPct}%` }}
              title="Remaining purchasing power"
            />
          </div>
          <p className="text-xs text-gray-500">
            At {parseNumberInput(rate)}% inflation, your money loses{" "}
            <strong>{purchasingPowerLossPct.toFixed(1)}%</strong> of its buying
            power over {years} years. To preserve wealth, your investments must
            outpace inflation.
          </p>
        </div>
      </ResultPanel>
    </CalculatorShell>
  );
}
