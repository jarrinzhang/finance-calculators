/**
 * ui.tsx - 计算器共享 UI 组件
 *
 * 所有 React 计算器复用的小组件，保证视觉风格一致。
 */
import type { ReactNode } from "react";

/** 带标签的数字输入框 */
export function NumberField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = "any",
  id,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  step?: string;
  id: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 shadow-sm transition focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20 ${
            prefix ? "pl-7" : ""
          } ${suffix ? "pr-12" : ""}`}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

/** Range slider + 数字显示 */
export function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  id,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  id: string;
  formatValue?: (v: number) => string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-sm font-semibold text-brand-800 tabular-nums">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand-700"
      />
    </div>
  );
}

/** 主要结果展示卡（大号数字） */
export function ResultCard({
  label,
  value,
  subtext,
  accent = "bg-brand-800",
}: {
  label: string;
  value: string;
  subtext?: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-xl ${accent} p-6 text-white shadow-lg`}>
      <p className="text-sm font-medium uppercase tracking-wide opacity-90">{label}</p>
      <p className="mt-2 text-4xl font-bold tabular-nums sm:text-5xl">{value}</p>
      {subtext && <p className="mt-2 text-sm opacity-90">{subtext}</p>}
    </div>
  );
}

/** 次要结果行 */
export function ResultRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`tabular-nums ${
          emphasis ? "text-lg font-bold text-gray-900" : "text-sm font-semibold text-gray-900"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/** 计算器外层容器 */
export function CalculatorShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

/** 输入面板（左半边） */
export function InputPanel({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-5 border-b border-gray-200 bg-gray-50 p-6 md:border-b-0 md:border-r">
      <h3 className="text-base font-semibold text-gray-900">Enter your details</h3>
      {children}
    </div>
  );
}

/** 结果面板（右半边） */
export function ResultPanel({ children }: { children: ReactNode }) {
  return <div className="space-y-4 p-6">{children}</div>;
}
