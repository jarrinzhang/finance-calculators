/**
 * AutoLoanCalculator - 车贷计算器
 *
 * 输入：车价、首付、利率、年限、销售税、置换价值
 * 输出：融资金额、月供、总利息、总成本
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

export default function AutoLoanCalculator() {
  const [carPrice, setCarPrice] = useState("35000");
  const [downPayment, setDownPayment] = useState("5000");
  const [tradeIn, setTradeIn] = useState("0");
  const [rate, setRate] = useState("6.0");
  const [years, setYears] = useState(5);
  const [salesTaxPct, setSalesTaxPct] = useState("7");

  const result = useMemo(() => {
    const price = parseNumberInput(carPrice);
    const down = parseNumberInput(downPayment);
    const trade = parseNumberInput(tradeIn);
    const taxPct = parseNumberInput(salesTaxPct);

    const taxableAmount = Math.max(0, price - trade);
    const salesTax = taxableAmount * (taxPct / 100);
    const principal = Math.max(0, price + salesTax - down - trade);
    const monthly = calculateMonthlyPayment(principal, parseNumberInput(rate), years);
    const totalPaid = monthly * years * 12;
    const totalInterest = Math.max(0, totalPaid - principal);
    const totalCost = down + trade + totalPaid;

    return { salesTax, principal, monthly, totalPaid, totalInterest, totalCost };
  }, [carPrice, downPayment, tradeIn, rate, years, salesTaxPct]);

  return (
    <CalculatorShell>
      <InputPanel>
        <NumberField
          id="auto-price"
          label="Vehicle Price"
          prefix="$"
          value={carPrice}
          onChange={setCarPrice}
          step="500"
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            id="auto-down"
            label="Down Payment"
            prefix="$"
            value={downPayment}
            onChange={setDownPayment}
            step="500"
          />
          <NumberField
            id="auto-trade"
            label="Trade-In Value"
            prefix="$"
            value={tradeIn}
            onChange={setTradeIn}
            step="500"
          />
        </div>
        <NumberField
          id="auto-rate"
          label="Interest Rate (APR)"
          suffix="%"
          value={rate}
          onChange={setRate}
          step="0.01"
          hint="Average auto loan APR: ~7% for new, ~11% for used"
        />
        <NumberField
          id="auto-tax"
          label="Sales Tax Rate"
          suffix="%"
          value={salesTaxPct}
          onChange={setSalesTaxPct}
          step="0.1"
        />
        <RangeField
          id="auto-years"
          label="Loan Term"
          value={years}
          min={2}
          max={8}
          step={1}
          onChange={setYears}
          formatValue={(v) => `${v} ${v === 1 ? "year" : "years"}`}
        />
      </InputPanel>

      <ResultPanel>
        <ResultCard
          label="Monthly Payment"
          value={formatCurrency(result.monthly)}
          subtext={`For a ${years}-year auto loan`}
          accent="bg-gradient-to-br from-rose-600 to-rose-800"
        />
        <div className="rounded-xl border border-gray-200 bg-white px-5">
          <ResultRow label="Vehicle Price" value={formatCurrency(parseNumberInput(carPrice))} />
          <ResultRow label="Sales Tax" value={formatCurrency(result.salesTax)} />
          <ResultRow label="Amount Financed" value={formatCurrency(result.principal)} />
          <ResultRow label="Total Interest" value={formatCurrency(result.totalInterest)} />
          <ResultRow
            label="Total Vehicle Cost"
            value={formatCurrency(result.totalCost)}
            emphasis
          />
        </div>
        <p className="text-xs text-gray-500">
          Over the life of the loan, you'll pay {formatCurrency(result.totalInterest)} in
          interest. A larger down payment or shorter term can reduce this significantly.
        </p>
      </ResultPanel>
    </CalculatorShell>
  );
}
