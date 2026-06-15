/**
 * finance.test.mjs - 金融公式正确性验证脚本
 *
 * 用法：node src/lib/finance.test.mjs
 *
 * 所有 expected 值来自权威来源（Bankrate、calculator.net 公式验证）
 * 容差：$0.50（浮点误差允许范围）
 *
 * 等额本息月供公式：
 *   M = P * (r(1+r)^n) / ((1+r)^n - 1)
 *   P=本金, r=月利率, n=总月数
 */

import {
  calculateMonthlyPayment,
  calculateAmortization,
  calculateCompoundInterest,
  calculateRecurringInvestment,
  calculateRetirement,
  calculateCreditCardPayoff,
  calculatePaymentForPayoff,
  calculateSavingsGoal,
  calculateROI,
  calculateAPR,
  compareLoans,
  calculateSalary,
  annualToHourly,
  calculateInflation,
  calculateInvestment,
  calculateCD,
  formatCurrency,
  parseNumberInput,
} from "./finance.ts";

let passed = 0;
let failed = 0;

function approxEqual(actual, expected, tolerance = 0.5) {
  return Math.abs(actual - expected) <= tolerance;
}

function assert(name, actual, expected, tolerance = 0.5) {
  const ok = approxEqual(actual, expected, tolerance);
  if (ok) {
    passed++;
    console.log(`  ✅ ${name}`);
    console.log(`     actual=${actual.toFixed(4)}  expected=${expected.toFixed(4)}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}`);
    console.log(`     actual=${actual.toFixed(4)}  expected=${expected.toFixed(4)}`);
    console.log(`     diff=${Math.abs(actual - expected).toFixed(4)} (tol=${tolerance})`);
  }
}

console.log("\n========================================");
console.log(" 金融公式正确性验证");
console.log("========================================\n");

/* -----------------------------------------------------------
 * 1. 月供公式（等额本息）
 * 公式参考：Bankrate / calculator.net / 美国房贷标准公式
 * ----------------------------------------------------------- */

console.log("【1】Mortgage / Loan Monthly Payment\n");

// 测试 1: 经典 30 年房贷
// $320,000 @ 6.5% for 30 years
// 验证来源：calculator.net mortgage calculator → $2,022.62
assert(
  "$320k @ 6.5% × 30yr → 月供",
  calculateMonthlyPayment(320000, 6.5, 30),
  2022.62
);

// 测试 2: $200,000 @ 5% for 30 years
// 公式手算：M = 200000 * (0.004167*(1.004167)^360) / ((1.004167)^360 - 1)
// = $1,073.64
assert(
  "$200k @ 5% × 30yr → 月供",
  calculateMonthlyPayment(200000, 5, 30),
  1073.64
);

// 测试 3: $25,000 个人贷款 @ 9.5% for 5 years
// Python Decimal 高精度验证 → $525.0465
assert(
  "$25k @ 9.5% × 5yr → 月供",
  calculateMonthlyPayment(25000, 9.5, 5),
  525.0465
);

// 测试 4: $35,000 车贷 @ 6% for 5 years (price-down)
// 融资金额 = $35,000 - $5,000 = $30,000 + 7% 销售税 (按 trade-in 扣除后)
// 这里单独测月供公式：$30,000 @ 6% × 5yr → $579.98
assert(
  "$30k @ 6% × 5yr → 月供",
  calculateMonthlyPayment(30000, 6, 5),
  579.98
);

// 测试 5: 0% 利率退化（应等于本金/期数）
// $12,000 @ 0% × 24 months = $500
assert(
  "$12k @ 0% × 2yr → 月供",
  calculateMonthlyPayment(12000, 0, 2),
  500
);

// 测试 6: 短期高额
// $500,000 @ 7% × 15yr → $4,494.14
assert(
  "$500k @ 7% × 15yr → 月供",
  calculateMonthlyPayment(500000, 7, 15),
  4494.14
);

/* -----------------------------------------------------------
 * 2. 摊销表
 * ----------------------------------------------------------- */

console.log("\n【2】Amortization Schedule\n");

// $100,000 @ 6% × 30 years，共 360 期
const sched = calculateAmortization(100000, 6, 30);
assert("摊销表应有 360 期", sched.length, 360, 0);

// 第 1 期：利息 = 100,000 * (0.06/12) = $500
// 本金 = 月供(599.55) - 500 = 99.55
assert("第1期 利息", sched[0].interest, 500, 0.05);
assert("第1期 本金", sched[0].principal, 99.55, 0.05);

// 最后一期 balance 必须为 0
assert("最后一期余额应为 0", sched[359].balance, 0, 0.05);

// 月供本身应该对：$100k @ 6% × 30 → $599.55
assert("摊销表月供 $100k @ 6% × 30", sched[0].payment, 599.55, 0.05);

// 全期累计本金 ≈ 初始贷款额（应在 $1 内）
const totalPrincipalPaid = sched.reduce((s, r) => s + r.principal, 0);
assert("累计本金 ≈ 100,000", totalPrincipalPaid, 100000, 1);

/* -----------------------------------------------------------
 * 3. 复利（一次性本金）
 * ----------------------------------------------------------- */

console.log("\n【3】Compound Interest (Lump Sum)\n");

// $10,000 @ 5% compounded annually for 10 years
// A = 10000 * (1.05)^10 = $16,288.95
assert(
  "$10k @ 5% 年复利 × 10yr",
  calculateCompoundInterest(10000, 5, 1, 10),
  16288.95
);

// $5,000 @ 8% compounded monthly for 20 years
// A = 5000 * (1 + 0.08/12)^(12*20)
// Python Decimal 高精度验证 → $24,634.0139
assert(
  "$5k @ 8% 月复利 × 20yr",
  calculateCompoundInterest(5000, 8, 12, 20),
  24634.0139
);

/* -----------------------------------------------------------
 * 4. 定投复利
 * ----------------------------------------------------------- */

console.log("\n【4】Recurring Investment (定投)\n");

// $10,000 初始 + $500/月 @ 7% 月复利 × 20 years
// Python Decimal 高精度验证 → $300,850.7184
const recurring = calculateRecurringInvestment(10000, 500, 7, 12, 20);
assert(
  "初始$10k + $500/mo @ 7% × 20yr → 终值",
  recurring.futureValue,
  300850.7184,
  5
);
// 总投入 = 10000 + 500*240 = 130000
assert(
  "总投入",
  recurring.totalContributions,
  130000,
  0.01
);

// 0% 利率：终值 = 初始 + 月供*月数
const noInterest = calculateRecurringInvestment(1000, 100, 0, 12, 5);
// = 1000 + 100*60 = 7000
assert(
  "0% 利率终值",
  noInterest.futureValue,
  7000,
  0.01
);

/* -----------------------------------------------------------
 * 5. 退休金
 * ----------------------------------------------------------- */

console.log("\n【5】Retirement\n");

const ret = calculateRetirement(30, 65, 50000, 1000, 7, 30, 4);
// nestEgg = recurring(50000, 1000, 7, 12, 35)
// Python Decimal 高精度验证 → $2,376,362.19
assert(
  "30→65岁 nest egg ($50k + $1k/mo @ 7%)",
  ret.nestEgg,
  2376362.19,
  10
);
// 月退休收入 = nestEgg * 0.04 / 12
assert(
  "退休月收入 (4% rule)",
  ret.monthlyRetirementIncome,
  ret.nestEgg * 0.04 / 12,
  0.01
);

// 退休年龄已过的边界情况
const past = calculateRetirement(70, 65, 100000, 0, 7, 30, 4);
assert(
  "已退休：nestEgg = 当前储蓄",
  past.nestEgg,
  100000,
  0.01
);

/* -----------------------------------------------------------
 * 6. 信用卡还款
 * ----------------------------------------------------------- */

console.log("\n【6】Credit Card Payoff\n");

// $5000 余额 @ 20%，月供 $200
// Python Decimal 迭代法验证 → months=33, totalPaid=6522.10, interest=1522.10
const cc1 = calculateCreditCardPayoff(5000, 20, 200);
assert("CC Payoff months ($200)", cc1.months, 33, 0);
assert("CC Payoff totalPaid", cc1.totalPaid, 6522.10, 1);
assert("CC Payoff interest", cc1.totalInterest, 1522.10, 1);
assert("CC Payoff canPayOff", cc1.canPayOff ? 1 : 0, 1, 0);

// 月供 $300（加速还款）
const cc2 = calculateCreditCardPayoff(5000, 20, 300);
assert("CC Payoff months ($300)", cc2.months, 20, 0);
assert("CC Payoff interest ($300)", cc2.totalInterest, 906.81, 1);

// 月供不足（永远还不清）
const cc3 = calculateCreditCardPayoff(5000, 20, 50);
assert("CC Payoff 不足时 canPayOff=false", cc3.canPayOff ? 1 : 0, 0, 0);

// PaymentForPayoff
// $5000 @ 20% 12 个月 → $463.17
assert(
  "PaymentForPayoff 12mo",
  calculatePaymentForPayoff(5000, 20, 12),
  463.17,
  0.05
);
// 24 个月 → $254.48
assert(
  "PaymentForPayoff 24mo",
  calculatePaymentForPayoff(5000, 20, 24),
  254.48,
  0.05
);

/* -----------------------------------------------------------
 * 7. 储蓄目标
 * ----------------------------------------------------------- */

console.log("\n【7】Savings Goal\n");

// $50k 目标, $5k 起点, @5%, 36 个月
// Python Decimal 验证 → monthly=$1140.36, currentFv=$5807.36
const sg = calculateSavingsGoal(50000, 5000, 5, 36);
assert("SavingsGoal 月存", sg.monthlyContribution, 1140.36, 1);
assert("SavingsGoal 当前储蓄终值", sg.currentSavingsFv, 5807.36, 1);

/* -----------------------------------------------------------
 * 8. ROI
 * ----------------------------------------------------------- */

console.log("\n【8】ROI\n");

// $10k → $15k, 3 年
// Python Decimal 验证 → totalReturn=5000, roiPercent=50, annualized=14.4714
const roi = calculateROI(10000, 15000, 3);
assert("ROI 绝对收益", roi.totalReturn, 5000, 0.01);
assert("ROI 百分比", roi.roiPercent, 50, 0.01);
assert("ROI 年化", roi.annualizedRoiPercent, 14.4714, 0.01);

// 边界：本金 0
const roiZero = calculateROI(0, 1000, 1);
assert("ROI 本金0 返回0", roiZero.roiPercent, 0, 0.01);

/* -----------------------------------------------------------
 * 9. APR
 * ----------------------------------------------------------- */

console.log("\n【9】APR\n");

// $10k 本金, $500 费用, 6% 名义利率, 5 年
// Python Decimal 验证 → aprPercent=8.1543, monthlyPayment=193.3280, netAmount=9500
const apr = calculateAPR(10000, 500, 6, 5);
assert("APR 含费后真实年化", apr.aprPercent, 8.1543, 0.05);
assert("APR 月供", apr.monthlyPayment, 193.33, 0.05);
assert("APR 实到金额", apr.netAmount, 9500, 0.01);

/* -----------------------------------------------------------
 * 10. 贷款对比
 * ----------------------------------------------------------- */

console.log("\n【10】Loan Comparison\n");

const options = [
  { label: "3-year", principal: 10000, annualRatePercent: 5, years: 3 },
  { label: "5-year", principal: 10000, annualRatePercent: 7, years: 5 },
  { label: "7-year", principal: 10000, annualRatePercent: 9, years: 7 },
];
const compared = compareLoans(options);
assert("Loan Comparison 返回 3 个选项", compared.length, 3, 0);
// 第一个：$10k@5%×3yr → 月供 ~$299.71, 总利息 ~$789.52
// Python 验证：monthly=299.7089, totalInterest=789.52
assert("Loan#1 月供", compared[0].monthlyPayment, 299.71, 0.1);
assert("Loan#1 总利息", compared[0].totalInterest, 789.52, 1);

/* -----------------------------------------------------------
 * 12. 工资换算
 * ----------------------------------------------------------- */

console.log("\n【12】Salary Conversion\n");

// $25/hr, 40hr/week
// Python Decimal: weekly=1000, biweekly=2000, semiMonthly=2166.67, monthly=4333.33, annual=52000
const sal = calculateSalary(25, 40);
assert("Salary 周薪", sal.weekly, 1000, 0.01);
assert("Salary 双周薪", sal.biweekly, 2000, 0.01);
assert("Salary 半月薪", sal.semiMonthly, 2166.67, 0.01);
assert("Salary 月薪", sal.monthly, 4333.33, 0.01);
assert("Salary 年薪", sal.annual, 52000, 0.01);

// annualToHourly: $52000 → $25/hr
assert("annualToHourly($52k)", annualToHourly(52000, 40), 25, 0.01);

/* -----------------------------------------------------------
 * 13. 通货膨胀
 * ----------------------------------------------------------- */

console.log("\n【13】Inflation\n");

// $10000 @ 3% × 20 年
// Python Decimal: futureValue=18061.11, purchasingPower=5536.76, totalInflation=8061.11
const infl = calculateInflation(10000, 3, 20);
assert("Inflation 未来等价金额", infl.futureValue, 18061.11, 0.5);
assert("Inflation 今天 $1 的未来购买力（按 $10k 计）", infl.purchasingPower, 5536.76, 0.5);
assert("Inflation 累计涨幅", infl.totalInflation, 8061.11, 0.5);

/* -----------------------------------------------------------
 * 14. 通用投资
 * ----------------------------------------------------------- */

console.log("\n【14】Investment (general)\n");

// $10k 初始 + $500/月 @ 7% × 20 年（应与 recurring 一致：$300,850.72）
// Python Decimal 验证 + 与 recurring 交叉验证
const inv = calculateInvestment(10000, 500, 7, 12, 20);
assert("Investment 终值", inv.futureValue, 300850.72, 1);
assert("Investment 总投入", inv.totalContributions, 130000, 0.01);
assert("Investment 总利息", inv.totalInterest, 170850.72, 1);
// yearlyBreakdown 应有 20 条
assert("Investment 年度明细数量", inv.yearlyBreakdown.length, 20, 0);
// 第 1 年的 balance 应该 > 初始 + 12 次月供
console.log(`  第1年 balance: ${inv.yearlyBreakdown[0].balance.toFixed(2)} (应 > 16000)`);

/* -----------------------------------------------------------
 * 15. 定期存款 CD
 * ----------------------------------------------------------- */

console.log("\n【15】CD\n");

// $10k @ 5% APY × 1 年（日复利）
// Python Decimal: finalValue=10512.67, totalInterest=512.67, effectiveApy=5.1267
const cd1 = calculateCD(10000, 5, 1);
assert("CD 1年终值", cd1.finalValue, 10512.67, 0.5);
assert("CD 1年利息", cd1.totalInterest, 512.67, 0.5);
assert("CD 有效APY", cd1.effectiveApy, 5.1267, 0.01);

// $10k @ 5% APY × 5 年
// Python Decimal: finalValue=12840.03, totalInterest=2840.03
const cd5 = calculateCD(10000, 5, 5);
assert("CD 5年终值", cd5.finalValue, 12840.03, 0.5);
assert("CD 5年利息", cd5.totalInterest, 2840.03, 0.5);

// 边界：0% APY
const cd0 = calculateCD(10000, 0, 1);
assert("CD 0% 终值 = 本金", cd0.finalValue, 10000, 0.01);
assert("CD 0% 利息 = 0", cd0.totalInterest, 0, 0.01);

/* -----------------------------------------------------------
 * 16. 格式化与解析工具
 * ----------------------------------------------------------- */

console.log("\n【16】Formatting & Parsing\n");

console.log("\n【6】Formatting & Parsing\n");

// formatCurrency
const fmt1 = formatCurrency(1234.5);
console.log(`  formatCurrency(1234.5) = "${fmt1}"`);
if (fmt1.includes("1,234.50") || fmt1.includes("$1,234.5")) {
  console.log("  ✅ 数字+逗号格式正确");
  passed++;
} else {
  console.log("  ❌ 格式异常");
  failed++;
}

// 负数
const fmt2 = formatCurrency(-500);
console.log(`  formatCurrency(-500) = "${fmt2}"`);
if (fmt2.includes("500")) {
  console.log("  ✅ 负数处理正确");
  passed++;
} else {
  console.log("  ❌ 负数处理异常");
  failed++;
}

// parseNumberInput 容错
const parseTests = [
  { input: "$1,234.56", expected: 1234.56 },
  { input: "  1,000 ", expected: 1000 },
  { input: "$5,000.00", expected: 5000 },
  { input: "abc", expected: 0 },
  { input: "", expected: 0 },
];
for (const t of parseTests) {
  const actual = parseNumberInput(t.input);
  const ok = Math.abs(actual - t.expected) < 0.01;
  if (ok) {
    passed++;
    console.log(`  ✅ parse("${t.input}") = ${actual}`);
  } else {
    failed++;
    console.log(`  ❌ parse("${t.input}") = ${actual}, expected ${t.expected}`);
  }
}

/* -----------------------------------------------------------
 * 总结
 * ----------------------------------------------------------- */

console.log("\n========================================");
console.log(` 结果：${passed} passed, ${failed} failed`);
console.log("========================================\n");

if (failed > 0) {
  console.error("⚠️  有失败用例！请检查公式实现。");
  process.exit(1);
} else {
  console.log("🎉 所有公式验证通过！");
}
