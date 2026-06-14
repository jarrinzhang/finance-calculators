/**
 * CompoundInterestCalculator - 复利计算器
 *
 * 输入：初始本金、月度追加、利率、年限、复利频率
 * 输出：到期总额、总投入、总收益
 */
import { useMemo, useState } from "react";
import {
  calculateRecurringInvestment,
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

const COMPOUND_OPTIONS = [
  { label: "Annually", value: 1 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Daily", value: 365 },
];

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [monthly, setMonthly] = useState("500");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState(20);
  const [compoundPerYear, setCompoundPerYear] = useState(12);

  const result = useMemo(() => {
    return calculateRecurringInvestment(
      parseNumberInput(principal),
      parseNumberInput(monthly),
      parseNumberInput(rate),
      compoundPerYear,
      years
    );
  }, [principal, monthly, rate, years, compoundPerYear]);

  // 收益百分比（用于进度条）
  const interestPct =
    result.futureValue > 0
      ? (result.totalInterest / result.futureValue) * 100
      : 0;

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="ci-principal"
          label="Initial Investment"
          prefix="$"
          value={principal}
          onChange={setPrincipal}
          step="500"
        />
        <NumberField
          id="ci-monthly"
          label="Monthly Contribution"
          prefix="$"
          value={monthly}
          onChange={setMonthly}
          step="50"
        />
        <NumberField
          id="ci-rate"
          label="Annual Rate of Return"
          suffix="%"
          value={rate}
          onChange={setRate}
          step="0.1"
          hint="S&P 500 historical average is ~10% before inflation"
        />
        <RangeField
          id="ci-years"
          label="Time Horizon"
          value={years}
          min={1}
          max={50}
          step={1}
          onChange={setYears}
          formatValue={(v) => `${v} ${v === 1 ? "year" : "years"}`}
        />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Compounding Frequency</label>
          <div className="flex flex-wrap gap-2">
            {COMPOUND_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCompoundPerYear(opt.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  compoundPerYear === opt.value
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Future Balance"
          value={formatCurrency(result.futureValue)}
          subtext={`After ${years} ${years === 1 ? "year" : "years"}`}
          accent="bg-gradient-to-br from-violet-600 to-violet-800"
        />
        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow
            label="Initial Investment"
            value={formatCurrency(parseNumberInput(principal))}
          />
          <ResultRow
            label="Total Contributions"
            value={formatCurrency(
              result.totalContributions - parseNumberInput(principal)
            )}
          />
          <ResultRow
            label="Interest Earned"
            value={formatCurrency(result.totalInterest)}
          />
          <ResultRow
            label="Total Invested"
            value={formatCurrency(result.totalContributions)}
          />
          <ResultRow
            label="Final Balance"
            value={formatCurrency(result.futureValue)}
            emphasis
          />
        </div>

        {/* 本金 vs 利息占比 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Interest share of balance</span>
            <span>{interestPct.toFixed(1)}%</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-brand-700"
              style={{ width: `${100 - interestPct}%` }}
              title="Principal"
            />
            <div
              className="h-full bg-violet-500"
              style={{ width: `${interestPct}%` }}
              title="Interest"
            />
          </div>
          <p className="text-xs text-gray-500">
            Compound interest accounts for {formatCurrency(result.totalInterest)} of your final
            balance &mdash; that's the magic of compounding over time.
          </p>
        </div>
      </ResultPanel>
    </CalculatorShell>
  );
}
