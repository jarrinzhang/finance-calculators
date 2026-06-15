/**
 * SalaryCalculator - 工资换算器
 *
 * 双模式：
 * - "fromHourly"：输入时薪 → 推算年薪/月薪/周薪
 * - "fromAnnual"：输入年薪 → 推算时薪/月薪/周薪
 */
import { useMemo, useState } from "react";
import {
  calculateSalary,
  annualToHourly,
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

type Mode = "fromHourly" | "fromAnnual";

export default function SalaryCalculator() {
  const [mode, setMode] = useState<Mode>("fromHourly");
  const [hourlyRate, setHourlyRate] = useState("25");
  const [annualSalary, setAnnualSalary] = useState("52000");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");

  const hpw = parseNumberInput(hoursPerWeek) || 40;

  const result = useMemo(() => {
    if (mode === "fromHourly") {
      return calculateSalary(parseNumberInput(hourlyRate), hpw);
    } else {
      const annual = parseNumberInput(annualSalary);
      const hourly = annualToHourly(annual, hpw);
      return calculateSalary(hourly, hpw);
    }
  }, [mode, hourlyRate, annualSalary, hpw]);

  // 税前 vs 税后估算（联邦税粗估 22%）
  const estimatedAfterTax = result.annual * 0.78;

  return (
    <CalculatorShell>
      <InputPanel>
        <div className="flex rounded-lg border border-gray-300 p-1">
          <button
            type="button"
            onClick={() => setMode("fromHourly")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              mode === "fromHourly"
                ? "bg-brand-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Hourly → Salary
          </button>
          <button
            type="button"
            onClick={() => setMode("fromAnnual")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              mode === "fromAnnual"
                ? "bg-brand-800 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Salary → Hourly
          </button>
        </div>

        {mode === "fromHourly" ? (
          <NumberField
            id="sal-hourly"
            label="Hourly Rate"
            prefix="$"
            value={hourlyRate}
            onChange={setHourlyRate}
            step="0.5"
          />
        ) : (
          <NumberField
            id="sal-annual"
            label="Annual Salary"
            prefix="$"
            value={annualSalary}
            onChange={setAnnualSalary}
            step="1000"
          />
        )}

        <NumberField
          id="sal-hours"
          label="Hours per Week"
          value={hoursPerWeek}
          onChange={setHoursPerWeek}
          step="1"
          hint="Standard full-time is 40 hours"
        />
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label={mode === "fromHourly" ? "Annual Salary" : "Equivalent Hourly Rate"}
          value={
            mode === "fromHourly"
              ? formatCurrency(result.annual)
              : formatCurrency(result.hourly)
          }
          subtext={`At ${hpw} hours/week`}
          accent="bg-gradient-to-br from-indigo-600 to-indigo-800"
        />

        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow label="Hourly" value={formatCurrency(result.hourly)} />
          <ResultRow label="Weekly" value={formatCurrency(result.weekly)} />
          <ResultRow label="Bi-weekly" value={formatCurrency(result.biweekly)} />
          <ResultRow label="Semi-monthly" value={formatCurrency(result.semiMonthly)} />
          <ResultRow label="Monthly" value={formatCurrency(result.monthly)} />
          <ResultRow label="Annual" value={formatCurrency(result.annual)} emphasis />
        </div>

        <p className="text-xs text-gray-500">
          Estimated take-home (after ~22% tax):{" "}
          <strong>{formatCurrency(estimatedAfterTax)}/yr</strong> ·{" "}
          {formatCurrency(estimatedAfterTax / 12)}/mo. Actual taxes vary by
          state, filing status, and deductions.
        </p>
      </ResultPanel>
    </CalculatorShell>
  );
}
