/**
 * InvestmentCalculator - 通用投资计算器
 *
 * 输入：初始本金、定投金额、年化收益、年限
 * 输出：终值、总投入、总利息 + 年度增长明细
 */
import { useMemo, useState } from "react";
import {
  calculateInvestment,
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

export default function InvestmentCalculator() {
  const [initial, setInitial] = useState("10000");
  const [monthly, setMonthly] = useState("500");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState(20);

  const result = useMemo(() => {
    return calculateInvestment(
      parseNumberInput(initial),
      parseNumberInput(monthly),
      parseNumberInput(rate),
      12,
      years
    );
  }, [initial, monthly, rate, years]);

  const interestPct =
    result.futureValue > 0
      ? (result.totalInterest / result.futureValue) * 100
      : 0;

  // 简化的年度趋势（取前 5、中、末几个点展示）
  const breakdown = result.yearlyBreakdown;
  const samplePoints = breakdown.length <= 6
    ? breakdown
    : [
        breakdown[0],
        breakdown[Math.floor(breakdown.length * 0.25)],
        breakdown[Math.floor(breakdown.length * 0.5)],
        breakdown[Math.floor(breakdown.length * 0.75)],
        breakdown[breakdown.length - 1],
      ];
  const maxBalance = Math.max(...samplePoints.map((p) => p.balance), 1);

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="inv-initial"
          label="Initial Investment"
          prefix="$"
          value={initial}
          onChange={setInitial}
          step="500"
        />
        <NumberField
          id="inv-monthly"
          label="Monthly Contribution"
          prefix="$"
          value={monthly}
          onChange={setMonthly}
          step="50"
        />
        <NumberField
          id="inv-rate"
          label="Annual Return Rate"
          suffix="%"
          value={rate}
          onChange={setRate}
          step="0.1"
          hint="S&P 500 long-term average: ~10% (before inflation)"
        />
        <RangeField
          id="inv-years"
          label="Investment Time Horizon"
          value={years}
          min={1}
          max={40}
          step={1}
          onChange={setYears}
          formatValue={(v) => `${v} ${v === 1 ? "year" : "years"}`}
        />
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Projected Balance"
          value={formatCurrency(result.futureValue)}
          subtext={`After ${years} ${years === 1 ? "year" : "years"}`}
          accent="bg-gradient-to-br from-indigo-600 to-indigo-800"
        />

        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow
            label="Your Contributions"
            value={formatCurrency(result.totalContributions)}
          />
          <ResultRow
            label="Investment Earnings"
            value={formatCurrency(result.totalInterest)}
          />
          <ResultRow
            label="Total Balance"
            value={formatCurrency(result.futureValue)}
            emphasis
          />
        </div>

        {/* 简化柱状趋势图 */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-600">Growth over time</p>
          <div className="flex items-end justify-between gap-1 h-24">
            {samplePoints.map((p, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-brand-700 to-brand-500"
                  style={{ height: `${(p.balance / maxBalance) * 80}%` }}
                  title={`Year ${p.year}: ${formatCurrency(p.balance)}`}
                />
                <span className="text-[10px] text-gray-500">Yr {p.year}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            Compound earnings make up {interestPct.toFixed(1)}% of your final
            balance &mdash; the earlier you start, the bigger this slice becomes.
          </p>
        </div>
      </ResultPanel>
    </CalculatorShell>
  );
}
