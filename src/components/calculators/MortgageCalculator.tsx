/**
 * MortgageCalculator - 房贷计算器
 *
 * 输入：房价、首付、利率、年限
 * 输出：月供、总支付、总利息、本金比例 + 摊销表（前 12 个月 + 末尾）
 */
import { useMemo, useState } from "react";
import {
  calculateMonthlyPayment,
  calculateAmortization,
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

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("400000");
  const [downPayment, setDownPayment] = useState("80000");
  const [rate, setRate] = useState("6.5");
  const [years, setYears] = useState(30);
  const [showFull, setShowFull] = useState(false);

  const principal = Math.max(0, parseNumberInput(homePrice) - parseNumberInput(downPayment));
  const downPaymentPct =
    parseNumberInput(homePrice) > 0
      ? (parseNumberInput(downPayment) / parseNumberInput(homePrice)) * 100
      : 0;

  const result = useMemo(() => {
    const monthly = calculateMonthlyPayment(principal, parseNumberInput(rate), years);
    const totalPaid = monthly * years * 12;
    const totalInterest = totalPaid - principal;
    const schedule = calculateAmortization(principal, parseNumberInput(rate), years);
    return { monthly, totalPaid, totalInterest, schedule };
  }, [principal, rate, years]);

  const displaySchedule = showFull
    ? result.schedule
    : result.schedule.slice(0, 12);

  const monthlyPerThousand =
    principal > 0 ? result.monthly / (principal / 1000) : 0;

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="home-price"
          label="Home Price"
          prefix="$"
          value={homePrice}
          onChange={setHomePrice}
          step="1000"
        />
        <NumberField
          id="down-payment"
          label="Down Payment"
          prefix="$"
          value={downPayment}
          onChange={setDownPayment}
          step="1000"
          hint={downPaymentPct > 0 ? `${downPaymentPct.toFixed(1)}% of home price` : undefined}
        />
        <NumberField
          id="rate"
          label="Interest Rate"
          suffix="%"
          value={rate}
          onChange={setRate}
          step="0.01"
        />
        <RangeField
          id="years"
          label="Loan Term"
          value={years}
          min={5}
          max={40}
          step={5}
          onChange={setYears}
          formatValue={(v) => `${v} years`}
        />

        <div className="rounded-lg bg-white p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Loan Amount</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {formatCurrency(principal)}
            </span>
          </div>
        </div>
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Monthly Payment"
          value={formatCurrency(result.monthly)}
          subtext={`For a ${years}-year fixed mortgage`}
        />
        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow
            label="Loan Principal"
            value={formatCurrency(principal)}
          />
          <ResultRow
            label="Total Interest Paid"
            value={formatCurrency(result.totalInterest)}
          />
          <ResultRow
            label="Total of All Payments"
            value={formatCurrency(result.totalPaid)}
            emphasis
          />
        </div>
        <p className="text-xs text-gray-500">
          Monthly payment per $1,000 borrowed: {formatCurrency(monthlyPerThousand)}
        </p>
      </ResultPanel>

      {/* 摊销表 */}
      <div className="col-span-full border-t border-gray-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Amortization Schedule</h3>
          <button
            type="button"
            onClick={() => setShowFull((s) => !s)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {showFull ? "Show first year" : `Show all ${result.schedule.length} months`}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-4 font-medium">Month</th>
                <th className="py-2 pr-4 font-medium">Payment</th>
                <th className="py-2 pr-4 font-medium">Principal</th>
                <th className="py-2 pr-4 font-medium">Interest</th>
                <th className="py-2 pr-4 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {displaySchedule.map((row) => (
                <tr key={row.month} className="border-b border-gray-50">
                  <td className="py-2 pr-4 text-gray-600">{row.month}</td>
                  <td className="py-2 pr-4 text-gray-900">{formatCurrency(row.payment)}</td>
                  <td className="py-2 pr-4 text-gray-900">{formatCurrency(row.principal)}</td>
                  <td className="py-2 pr-4 text-gray-900">{formatCurrency(row.interest)}</td>
                  <td className="py-2 pr-4 text-gray-900">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </CalculatorShell>
  );
}
