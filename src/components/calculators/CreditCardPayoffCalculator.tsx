/**
 * CreditCardPayoffCalculator - 信用卡还款计算器
 *
 * 双模式：
 * - "byPayment"：给定月供 → 算还清时间和总利息
 * - "byMonths"：给定目标月数 → 算所需月供
 */
import { useMemo, useState } from "react";
import {
  calculateCreditCardPayoff,
  calculatePaymentForPayoff,
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

type Mode = "byPayment" | "byMonths";

export default function CreditCardPayoffCalculator() {
  const [mode, setMode] = useState<Mode>("byPayment");
  const [balance, setBalance] = useState("5000");
  const [apr, setApr] = useState("20");
  const [monthly, setMonthly] = useState("200");
  const [targetMonths, setTargetMonths] = useState("12");

  const bal = parseNumberInput(balance);
  const aprVal = parseNumberInput(apr);

  const result = useMemo(() => {
    if (mode === "byPayment") {
      const pay = parseNumberInput(monthly);
      const r = calculateCreditCardPayoff(bal, aprVal, pay);
      return {
        primaryValue: r.canPayOff
          ? `${r.months} mo`
          : "Never",
        primaryLabel: "Time to Pay Off",
        monthly: pay,
        totalPaid: r.canPayOff ? r.totalPaid : 0,
        totalInterest: r.canPayOff ? r.totalInterest : 0,
        canPayOff: r.canPayOff,
      };
    } else {
      const months = Math.round(parseNumberInput(targetMonths));
      const required = calculatePaymentForPayoff(bal, aprVal, months);
      const projected = calculateCreditCardPayoff(bal, aprVal, required);
      return {
        primaryValue: formatCurrency(required),
        primaryLabel: `Monthly Payment (to pay off in ${months} months)`,
        monthly: required,
        totalPaid: projected.canPayOff ? projected.totalPaid : 0,
        totalInterest: projected.canPayOff ? projected.totalInterest : 0,
        canPayOff: true,
      };
    }
  }, [mode, bal, aprVal, monthly, targetMonths]);

  return (
    <CalculatorShell>
      <InputPanel>
        {/* 模式切换 */}
        <div className="flex rounded-lg border border-gray-300 p-1">
          <button
            type="button"
            onClick={() => setMode("byPayment")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              mode === "byPayment"
                ? "bg-brand-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            I have a budget
          </button>
          <button
            type="button"
            onClick={() => setMode("byMonths")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              mode === "byMonths"
                ? "bg-brand-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            I have a goal
          </button>
        </div>

        <NumberField
          id="cc-balance"
          label="Current Balance"
          prefix="$"
          value={balance}
          onChange={setBalance}
          step="100"
        />
        <NumberField
          id="cc-apr"
          label="Annual Interest Rate (APR)"
          suffix="%"
          value={apr}
          onChange={setApr}
          step="0.1"
          hint="Average credit card APR: ~20-25%"
        />

        {mode === "byPayment" ? (
          <NumberField
            id="cc-monthly"
            label="Monthly Payment"
            prefix="$"
            value={monthly}
            onChange={setMonthly}
            step="10"
          />
        ) : (
          <NumberField
            id="cc-target"
            label="Target Payoff Time"
            suffix="months"
            value={targetMonths}
            onChange={setTargetMonths}
            step="1"
          />
        )}
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label={result.primaryLabel}
          value={result.primaryValue}
          subtext={
            result.canPayOff
              ? undefined
              : "Your payment doesn't cover monthly interest"
          }
          accent="bg-gradient-to-br from-rose-600 to-rose-800"
        />

        {result.canPayOff ? (
          <div className="rounded-xl border border-gray-200 bg-white px-5">
            <ResultRow
              label="Monthly Payment"
              value={formatCurrency(result.monthly)}
            />
            <ResultRow
              label="Total Interest Paid"
              value={formatCurrency(result.totalInterest)}
            />
            <ResultRow
              label="Total Amount Paid"
              value={formatCurrency(result.totalPaid)}
              emphasis
            />
          </div>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-medium">⚠️ Your payment is too low</p>
            <p className="mt-1">
              To make progress, your monthly payment must exceed the monthly
              interest charge (
              <strong>{formatCurrency((bal * (aprVal / 100)) / 12)}</strong>).
              Try increasing your payment or switch to "I have a goal" mode.
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Credit card interest compounds daily in practice. This calculator uses
          monthly compounding for simplicity; real-world payoff may be slightly
          faster.
        </p>
      </ResultPanel>
    </CalculatorShell>
  );
}
