/**
 * LoanComparisonCalculator - 贷款方案对比计算器
 *
 * 输入：3 个贷款方案（本金统一、利率/年限/费用可调）
 * 输出：每个方案的月供、总利息、真实 APR + 推荐最省钱的
 */
import { useMemo, useState } from "react";
import {
  compareLoans,
  formatCurrency,
  parseNumberInput,
  type LoanOption,
} from "../../lib/finance";
import {
  NumberField,
} from "./ui";

interface OptionInput {
  label: string;
  rate: string;
  years: string;
  fees: string;
}

const DEFAULTS: OptionInput[] = [
  { label: "Option A", rate: "5", years: "3", fees: "200" },
  { label: "Option B", rate: "7", years: "5", fees: "0" },
  { label: "Option C", rate: "9", years: "7", fees: "0" },
];

const ACCENTS = [
  "border-blue-300 bg-blue-50/50",
  "border-emerald-300 bg-emerald-50/50",
  "border-violet-300 bg-violet-50/50",
];

export default function LoanComparisonCalculator() {
  const [amount, setAmount] = useState("10000");
  const [options, setOptions] = useState<OptionInput[]>(DEFAULTS);

  const updateOption = (i: number, field: keyof OptionInput, value: string) => {
    setOptions((prev) =>
      prev.map((o, idx) => (idx === i ? { ...o, [field]: value } : o))
    );
  };

  const results = useMemo(() => {
    const principal = parseNumberInput(amount);
    const opts: LoanOption[] = options.map((o) => ({
      label: o.label,
      principal,
      annualRatePercent: parseNumberInput(o.rate),
      years: parseNumberInput(o.years),
      fees: parseNumberInput(o.fees),
    }));
    const compared = compareLoans(opts);
    // 找总成本最低（总支付最少）
    const cheapestIdx = compared.reduce(
      (best, r, i) =>
        r.totalPaid < compared[best].totalPaid ? i : best,
      0
    );
    // 找月供最低
    const lowestMonthlyIdx = compared.reduce(
      (best, r, i) => (r.monthlyPayment < compared[best].monthlyPayment ? i : best),
      0
    );
    return { compared, cheapestIdx, lowestMonthlyIdx };
  }, [amount, options]);

  return (
    <div className="space-y-6">
      {/* 主输入：贷款金额 */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="max-w-sm">
          <NumberField
            id="lc-amount"
            label="Loan Amount (same for all options)"
            prefix="$"
            value={amount}
            onChange={setAmount}
            step="500"
          />
        </div>
      </div>

      {/* 三个对比卡片 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {results.compared.map((r, i) => {
          const isCheapest = i === results.cheapestIdx;
          const isLowestMonthly = i === results.lowestMonthlyIdx;
          return (
            <div
              key={i}
              className={`rounded-2xl border-2 p-5 shadow-sm ${ACCENTS[i % 3]}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">{options[i].label}</h3>
                {isCheapest && (
                  <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                    Lowest Total
                  </span>
                )}
                {!isCheapest && isLowestMonthly && (
                  <span className="rounded-full bg-brand-700 px-2 py-0.5 text-xs font-semibold text-white">
                    Lowest Monthly
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  id={`lc-${i}-rate`}
                  label="Rate"
                  suffix="%"
                  value={options[i].rate}
                  onChange={(v) => updateOption(i, "rate", v)}
                  step="0.1"
                />
                <NumberField
                  id={`lc-${i}-years`}
                  label="Years"
                  value={options[i].years}
                  onChange={(v) => updateOption(i, "years", v)}
                  step="1"
                />
                <NumberField
                  id={`lc-${i}-fees`}
                  label="Fees"
                  prefix="$"
                  value={options[i].fees}
                  onChange={(v) => updateOption(i, "fees", v)}
                  step="50"
                />
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Payment</span>
                  <span className="font-bold tabular-nums text-gray-900">
                    {formatCurrency(r.monthlyPayment)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Interest</span>
                  <span className="font-semibold tabular-nums text-gray-900">
                    {formatCurrency(r.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">True APR</span>
                  <span className="font-semibold tabular-nums text-gray-900">
                    {r.aprPercent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-base">
                  <span className="font-medium text-gray-700">Total Cost</span>
                  <span className="font-bold tabular-nums text-gray-900">
                    {formatCurrency(r.totalPaid)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 推荐解读 */}
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-sm text-brand-900">
        <p className="font-semibold">💡 Recommendation</p>
        <p className="mt-1">
          <strong>{options[results.cheapestIdx].label}</strong> costs you the
          least overall at{" "}
          <strong>
            {formatCurrency(results.compared[results.cheapestIdx].totalPaid)}
          </strong>{" "}
          total.{" "}
          {results.cheapestIdx !== results.lowestMonthlyIdx && (
            <>
              But if cash flow matters more than total cost,{" "}
              <strong>{options[results.lowestMonthlyIdx].label}</strong> has the
              lowest monthly payment at{" "}
              <strong>
                {formatCurrency(results.compared[results.lowestMonthlyIdx].monthlyPayment)}
              </strong>
              /mo.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
