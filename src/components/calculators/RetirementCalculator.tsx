/**
 * RetirementCalculator - 退休金计算器
 *
 * 输入：当前年龄、退休年龄、当前储蓄、月供、年化收益、提取率
 * 输出：退休时总额、月退休收入、收益 vs 本金
 */
import { useMemo, useState } from "react";
import {
  calculateRetirement,
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

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState("30");
  const [retireAge, setRetireAge] = useState("65");
  const [currentSavings, setCurrentSavings] = useState("50000");
  const [monthly, setMonthly] = useState("1000");
  const [returnRate, setReturnRate] = useState("7");
  const [withdrawRate, setWithdrawRate] = useState(4);

  const result = useMemo(() => {
    return calculateRetirement(
      parseNumberInput(currentAge),
      parseNumberInput(retireAge),
      parseNumberInput(currentSavings),
      parseNumberInput(monthly),
      parseNumberInput(returnRate),
      30, // 默认退休后 30 年
      withdrawRate
    );
  }, [currentAge, retireAge, currentSavings, monthly, returnRate, withdrawRate]);

  const interestPct =
    result.nestEgg > 0 ? (result.totalInterest / result.nestEgg) * 100 : 0;

  return (
    <CalculatorShell>
      <InputPanel>
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            id="ret-current-age"
            label="Current Age"
            value={currentAge}
            onChange={setCurrentAge}
            step="1"
          />
          <NumberField
            id="ret-retire-age"
            label="Retire at Age"
            value={retireAge}
            onChange={setRetireAge}
            step="1"
          />
        </div>
        <NumberField
          id="ret-savings"
          label="Current Savings"
          prefix="$"
          value={currentSavings}
          onChange={setCurrentSavings}
          step="1000"
        />
        <NumberField
          id="ret-monthly"
          label="Monthly Contribution"
          prefix="$"
          value={monthly}
          onChange={setMonthly}
          step="50"
        />
        <NumberField
          id="ret-return"
          label="Expected Annual Return"
          suffix="%"
          value={returnRate}
          onChange={setReturnRate}
          step="0.1"
          hint="A balanced portfolio historically returns 6-8%"
        />
        <RangeField
          id="ret-withdraw"
          label="Safe Withdrawal Rate"
          value={withdrawRate}
          min={2}
          max={7}
          step={0.5}
          onChange={setWithdrawRate}
          formatValue={(v) => `${v}%`}
        />
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Retirement Nest Egg"
          value={formatCurrency(result.nestEgg)}
          subtext={`At age ${parseNumberInput(retireAge)}`}
          accent="bg-gradient-to-br from-amber-500 to-amber-700"
        />
        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow
            label="Years to Save"
            value={`${result.yearsUntilRetirement} ${
              result.yearsUntilRetirement === 1 ? "year" : "years"
            }`}
          />
          <ResultRow
            label="Estimated Monthly Income"
            value={formatCurrency(result.monthlyRetirementIncome)}
            emphasis
          />
          <ResultRow
            label="Total You Contribute"
            value={formatCurrency(result.totalContributions)}
          />
          <ResultRow
            label="Investment Gains"
            value={formatCurrency(result.totalInterest)}
          />
        </div>

        {/* 本金 vs 收益 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Investment gains share</span>
            <span>{interestPct.toFixed(1)}%</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-brand-700"
              style={{ width: `${100 - interestPct}%` }}
              title="Your contributions"
            />
            <div
              className="h-full bg-amber-500"
              style={{ width: `${interestPct}%` }}
              title="Investment gains"
            />
          </div>
          <p className="text-xs text-gray-500">
            With a {withdrawRate}% withdrawal rate, your savings could support approximately{" "}
            {formatCurrency(result.monthlyRetirementIncome)} of monthly income in retirement,
            based on the 4% rule guideline.
          </p>
        </div>
      </ResultPanel>
    </CalculatorShell>
  );
}
