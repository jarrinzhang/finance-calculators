/**
 * ROICalculator - 简单投资回报率计算器
 *
 * 输入：初始投入、期末价值、持有年限
 * 输出：绝对收益、总 ROI %、年化 ROI（CAGR）
 */
import { useMemo, useState } from "react";
import {
  calculateROI,
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

export default function ROICalculator() {
  const [initial, setInitial] = useState("10000");
  const [final, setFinal] = useState("15000");
  const [years, setYears] = useState("3");

  const result = useMemo(() => {
    return calculateROI(
      parseNumberInput(initial),
      parseNumberInput(final),
      parseNumberInput(years)
    );
  }, [initial, final, years]);

  const isGain = result.totalReturn >= 0;
  const accent = isGain
    ? "bg-gradient-to-br from-emerald-600 to-emerald-800"
    : "bg-gradient-to-br from-rose-600 to-rose-800";

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="roi-initial"
          label="Initial Investment"
          prefix="$"
          value={initial}
          onChange={setInitial}
          step="500"
        />
        <NumberField
          id="roi-final"
          label="Final Value"
          prefix="$"
          value={final}
          onChange={setFinal}
          step="500"
          hint="What was your investment worth when you sold it?"
        />
        <NumberField
          id="roi-years"
          label="Holding Period"
          suffix="years"
          value={years}
          onChange={setYears}
          step="0.5"
        />
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Total Return on Investment"
          value={`${isGain ? "+" : ""}${result.roiPercent.toFixed(2)}%`}
          subtext={`${formatCurrency(result.totalReturn)} over ${parseNumberInput(years)} ${
            parseNumberInput(years) === 1 ? "year" : "years"
          }`}
          accent={accent}
        />
        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow
            label="Amount Invested"
            value={formatCurrency(parseNumberInput(initial))}
          />
          <ResultRow
            label="Final Value"
            value={formatCurrency(parseNumberInput(final))}
          />
          <ResultRow
            label="Profit / Loss"
            value={`${isGain ? "+" : ""}${formatCurrency(result.totalReturn)}`}
          />
          <ResultRow
            label="Annualized Return (CAGR)"
            value={`${result.annualizedRoiPercent.toFixed(2)}%`}
            emphasis
          />
        </div>

        {/* 解读 */}
        <div
          className={`rounded-xl p-4 text-sm ${
            isGain
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <p className="font-medium">
            {isGain ? "📈 This was a profitable investment" : "📉 This investment lost money"}
          </p>
          <p className="mt-1">
            Your money grew at an average of{" "}
            <strong>{result.annualizedRoiPercent.toFixed(2)}% per year</strong>.
            {result.annualizedRoiPercent > 7 && isGain && (
              <>
                {" "}That beats the S&amp;P 500's long-term average of ~10% — but past
                performance doesn't guarantee future results.
              </>
            )}
            {result.annualizedRoiPercent < 4 && isGain && (
              <>
                {" "}That's below a typical high-yield savings account (~4-5%),
                so this investment underperformed a low-risk alternative.
              </>
            )}
          </p>
        </div>
      </ResultPanel>
    </CalculatorShell>
  );
}
