/**
 * TipCalculator - 小费计算器
 *
 * 输入：账单金额、小费百分比、人数
 * 输出：小费金额、总金额、每人分摊
 */
import { useMemo, useState } from "react";
import { formatCurrency, parseNumberInput } from "../../lib/finance";
import {
  CalculatorShell,
  InputPanel,
  ResultPanel,
  NumberField,
  ResultCard,
  ResultRow,
} from "./ui";

const TIP_PRESETS = [15, 18, 20, 25];

export default function TipCalculator() {
  const [bill, setBill] = useState("100");
  const [tipPct, setTipPct] = useState(18);
  const [people, setPeople] = useState(1);

  const result = useMemo(() => {
    const billAmount = parseNumberInput(bill);
    const tip = billAmount * (tipPct / 100);
    const total = billAmount + tip;
    const perPerson = people > 0 ? total / people : total;
    const tipPerPerson = people > 0 ? tip / people : tip;
    return { billAmount, tip, total, perPerson, tipPerPerson };
  }, [bill, tipPct, people]);

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="tip-bill"
          label="Bill Amount"
          prefix="$"
          value={bill}
          onChange={setBill}
          step="1"
        />

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Tip Percentage</label>
          <div className="flex flex-wrap gap-2">
            {TIP_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTipPct(p)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  tipPct === p
                    ? "border-brand-700 bg-brand-700 text-white"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
          {/* 自定义小费百分比滑块 */}
          <input
            type="range"
            min={0}
            max={40}
            step={1}
            value={tipPct}
            onChange={(e) => setTipPct(parseInt(e.target.value))}
            className="w-full accent-brand-700"
          />
        </div>

        <NumberField
          id="tip-people"
          label="Number of People"
          value={String(people)}
          onChange={(v) => setPeople(Math.max(1, Math.round(parseNumberInput(v)) || 1))}
          step="1"
          hint={people > 1 ? `Splitting the bill ${people} ways` : undefined}
        />
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Total Bill"
          value={formatCurrency(result.total)}
          subtext={`Including ${tipPct}% tip`}
          accent="bg-gradient-to-br from-emerald-600 to-emerald-800"
        />

        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow label="Bill Subtotal" value={formatCurrency(result.billAmount)} />
          <ResultRow label={`Tip (${tipPct}%)`} value={formatCurrency(result.tip)} />
          <ResultRow label="Total" value={formatCurrency(result.total)} emphasis />
          {people > 1 && (
            <>
              <ResultRow
                label={`Tip per person (${people})`}
                value={formatCurrency(result.tipPerPerson)}
              />
              <ResultRow
                label={`Total per person (${people})`}
                value={formatCurrency(result.perPerson)}
                emphasis
              />
            </>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Tipping customs: 15-20% is standard at sit-down restaurants in the U.S.
          For exceptional service, consider 22-25%. Counter service typically needs no tip.
        </p>
      </ResultPanel>
    </CalculatorShell>
  );
}
