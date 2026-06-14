/**
 * LoanCalculator - 通用贷款计算器
 *
 * 输入：贷款额、利率、年限
 * 输出：月供、总支付、总利息、利率占比
 */
import { useMemo, useState } from "react";
import {
  calculateMonthlyPayment,
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

const TERM_PRESETS = [
  { label: "1 yr", value: 1 },
  { label: "3 yr", value: 3 },
  { label: "5 yr", value: 5 },
  { label: "10 yr", value: 10 },
  { label: "15 yr", value: 15 },
  { label: "20 yr", value: 20 },
];

export default function LoanCalculator() {
  const [amount, setAmount] = useState("25000");
  const [rate, setRate] = useState("9.5");
  const [years, setYears] = useState(5);

  const principal = parseNumberInput(amount);

  const result = useMemo(() => {
    const monthly = calculateMonthlyPayment(principal, parseNumberInput(rate), years);
    const totalPaid = monthly * years * 12;
    const totalInterest = Math.max(0, totalPaid - principal);
    const interestPct = totalPaid > 0 ? (totalInterest / totalPaid) * 100 : 0;
    return { monthly, totalPaid, totalInterest, interestPct };
  }, [principal, rate, years]);

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="loan-amount"
          label="Loan Amount"
          prefix="$"
          value={amount}
          onChange={setAmount}
          step="500"
        />
        <NumberField
          id="loan-rate"
          label="Annual Interest Rate"
          suffix="%"
          value={rate}
          onChange={setRate}
          step="0.01"
          hint="Typical personal loan rates range from 6% to 36%"
        />
        <RangeField
          id="loan-years"
          label="Loan Term"
          value={years}
          min={1}
          max={20}
          step={1}
          onChange={setYears}
          formatValue={(v) => `${v} ${v === 1 ? "year" : "years"}`}
        />
        <div className="flex flex-wrap gap-2 pt-1">
          {TERM_PRESETS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setYears(t.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                years === t.value
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Estimated Monthly Payment"
          value={formatCurrency(result.monthly)}
          subtext={`Over ${years} ${years === 1 ? "year" : "years"}`}
        />
        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow label="Loan Amount" value={formatCurrency(principal)} />
          <ResultRow label="Total Interest" value={formatCurrency(result.totalInterest)} />
          <ResultRow
            label="Total Repayment"
            value={formatCurrency(result.totalPaid)}
            emphasis
          />
        </div>

        {/* 利息占比可视化 */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Interest</span>
            <span>{result.interestPct.toFixed(1)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
              style={{ width: `${result.interestPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            You'll pay {formatCurrency(result.totalInterest)} in interest, which is{" "}
            {result.interestPct.toFixed(1)}% of your total repayment.
          </p>
        </div>
      </ResultPanel>
    </CalculatorShell>
  );
}
