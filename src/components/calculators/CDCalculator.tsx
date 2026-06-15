/**
 * CDCalculator - 定期存款（CD）计算器
 *
 * 输入：存款金额、APY、年限
 * 输出：到期金额、利息、有效 APY
 */
import { useMemo, useState } from "react";
import {
  calculateCD,
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
  { label: "6 mo", value: 0.5 },
  { label: "1 yr", value: 1 },
  { label: "2 yr", value: 2 },
  { label: "3 yr", value: 3 },
  { label: "5 yr", value: 5 },
];

export default function CDCalculator() {
  const [deposit, setDeposit] = useState("10000");
  const [apy, setApy] = useState("5");
  const [years, setYears] = useState(1);

  const result = useMemo(() => {
    return calculateCD(parseNumberInput(deposit), parseNumberInput(apy), years);
  }, [deposit, apy, years]);

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="cd-deposit"
          label="Deposit Amount"
          prefix="$"
          value={deposit}
          onChange={setDeposit}
          step="500"
        />
        <NumberField
          id="cd-apy"
          label="Annual Percentage Yield (APY)"
          suffix="%"
          value={apy}
          onChange={setApy}
          step="0.05"
          hint="Top CD rates (2026): 4.5-5.5% APY"
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">CD Term</label>
          <div className="flex flex-wrap gap-2">
            {TERM_PRESETS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setYears(t.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  years === t.value
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Value at Maturity"
          value={formatCurrency(result.finalValue)}
          subtext={`After ${years === 0.5 ? "6 months" : `${years} ${years === 1 ? "year" : "years"}`}`}
          accent="bg-gradient-to-br from-cyan-600 to-cyan-800"
        />

        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow label="Initial Deposit" value={formatCurrency(parseNumberInput(deposit))} />
          <ResultRow label="Interest Earned" value={formatCurrency(result.totalInterest)} />
          <ResultRow
            label="Total at Maturity"
            value={formatCurrency(result.finalValue)}
            emphasis
          />
        </div>

        <p className="text-xs text-gray-500">
          This CD effectively earns {result.effectiveApy.toFixed(2)}% per year
          (already factoring in daily compounding). CDs are FDIC-insured up to
          $250,000 per depositor &mdash; your principal is safe.
        </p>

        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
          <p className="font-medium">📌 CD vs. high-yield savings</p>
          <p className="mt-1">
            CDs lock in your rate but charge penalties for early withdrawal. A
            high-yield savings account offers similar rates (4-5% APY) with full
            liquidity. Choose a CD only when you're sure you won't need the money
            during the term.
          </p>
        </div>
      </ResultPanel>
    </CalculatorShell>
  );
}
