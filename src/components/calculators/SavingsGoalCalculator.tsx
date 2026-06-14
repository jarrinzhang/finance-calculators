/**
 * SavingsGoalCalculator - 储蓄目标计算器
 *
 * 输入：目标金额、当前储蓄、年化收益、目标月数
 * 输出：每月需要存多少 + 终值拆解
 */
import { useMemo, useState } from "react";
import {
  calculateSavingsGoal,
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

export default function SavingsGoalCalculator() {
  const [target, setTarget] = useState("50000");
  const [current, setCurrent] = useState("5000");
  const [rate, setRate] = useState("5");
  const [months, setMonths] = useState(36);

  const result = useMemo(() => {
    return calculateSavingsGoal(
      parseNumberInput(target),
      parseNumberInput(current),
      parseNumberInput(rate),
      months
    );
  }, [target, current, rate, months]);

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="sg-target"
          label="Savings Goal"
          prefix="$"
          value={target}
          onChange={setTarget}
          step="1000"
          hint="How much do you want to have saved?"
        />
        <NumberField
          id="sg-current"
          label="Already Saved"
          prefix="$"
          value={current}
          onChange={setCurrent}
          step="500"
        />
        <NumberField
          id="sg-rate"
          label="Annual Return Rate"
          suffix="%"
          value={rate}
          onChange={setRate}
          step="0.1"
          hint="High-yield savings: 4-5%, balanced portfolio: 6-8%"
        />
        <RangeField
          id="sg-months"
          label="Time to Reach Goal"
          value={months}
          min={1}
          max={120}
          step={1}
          onChange={setMonths}
          formatValue={(v) => `${v} ${v === 1 ? "month" : "months"} (${(v / 12).toFixed(1)} yrs)`}
        />
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Monthly Savings Needed"
          value={formatCurrency(result.monthlyContribution)}
          subtext={`To reach ${formatCurrency(parseNumberInput(target))} in ${months} months`}
          accent="bg-gradient-to-br from-emerald-600 to-emerald-800"
        />
        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow
            label="Current Savings Now"
            value={formatCurrency(parseNumberInput(current))}
          />
          <ResultRow
            label="Current Savings at Goal"
            value={formatCurrency(result.currentSavingsFv)}
          />
          <ResultRow
            label="Interest You'll Earn"
            value={formatCurrency(result.totalInterest)}
          />
          <ResultRow
            label="Total Contributions"
            value={formatCurrency(result.totalContributions)}
          />
        </div>

        {/* 进度条：储蓄构成 */}
        <div className="space-y-2">
          {result.totalInterest > 0 && (
            <>
              <div className="flex justify-between text-xs text-gray-500">
                <span>How interest helps</span>
                <span>
                  {(
                    (result.totalInterest /
                      (result.totalContributions + result.totalInterest)) *
                    100
                  ).toFixed(1)}
                  % of your goal
                </span>
              </div>
              <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full bg-brand-700"
                  style={{
                    width: `${(result.totalContributions /
                      (result.totalContributions + result.totalInterest)) *
                      100}%`,
                  }}
                  title="Your contributions"
                />
                <div
                  className="h-full bg-emerald-500"
                  style={{
                    width: `${(result.totalInterest /
                      (result.totalContributions + result.totalInterest)) *
                      100}%`,
                  }}
                  title="Interest earned"
                />
              </div>
            </>
          )}
          <p className="text-xs text-gray-500">
            By investing at {parseNumberInput(rate)}% APY, you'll earn{" "}
            <strong>{formatCurrency(result.totalInterest)}</strong> in interest,
            reducing how much you need to save out of pocket.
          </p>
        </div>
      </ResultPanel>
    </CalculatorShell>
  );
}
