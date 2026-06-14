/**
 * finance.ts - 金融计算公式工具库
 *
 * 所有计算器共享的纯函数。便于复用、单测。
 * 不依赖 DOM / React，可在任何环境调用。
 */

/** 把百分比值（如 5 表示 5%）转成小数 0.05 */
export function percentToDecimal(percent: number): number {
  return percent / 100;
}

/** 把年利率转成月利率小数 */
export function annualRateToMonthly(annualRatePercent: number): number {
  return percentToDecimal(annualRatePercent) / 12;
}

/**
 * 等额本息月供公式（贷款、房贷、车贷通用）
 *
 * M = P * r * (1+r)^n / ((1+r)^n - 1)
 *
 * - P: 本金
 * - r: 月利率（年利率 / 12 / 100）
 * - n: 期数（月）
 *
 * @param principal 本金（美元）
 * @param annualRatePercent 年利率（%，如 5 表示 5%）
 * @param years 贷款年限
 * @returns 每月还款额；利率为 0 时退化为 本金/期数
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  years: number
): number {
  const r = annualRateToMonthly(annualRatePercent);
  const n = years * 12;

  if (n <= 0) return 0;
  if (r === 0) return principal / n;

  const factor = Math.pow(1 + r, n);
  return (principal * r * factor) / (factor - 1);
}

/** 摊销表中每一期的明细 */
export interface AmortizationRow {
  /** 第几期（从 1 开始） */
  month: number;
  /** 当期还款额 */
  payment: number;
  /** 当期还本金 */
  principal: number;
  /** 当期还利息 */
  interest: number;
  /** 剩余本金 */
  balance: number;
}

/**
 * 生成完整摊销表
 *
 * @param principal 本金
 * @param annualRatePercent 年利率（%）
 * @param years 贷款年限
 * @returns 每月明细数组
 */
export function calculateAmortization(
  principal: number,
  annualRatePercent: number,
  years: number
): AmortizationRow[] {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRatePercent, years);
  const r = annualRateToMonthly(annualRatePercent);
  const n = years * 12;
  const rows: AmortizationRow[] = [];

  let balance = principal;
  for (let i = 1; i <= n; i++) {
    const interest = balance * r;
    // 最后一期修正：避免浮点误差导致余额为负
    const principalPaid = i === n ? balance : monthlyPayment - interest;
    balance = Math.max(0, balance - principalPaid);
    rows.push({
      month: i,
      payment: monthlyPayment,
      principal: principalPaid,
      interest,
      balance,
    });
  }
  return rows;
}

/**
 * 复利公式（一次性本金，定投另算）
 *
 * A = P * (1 + r/n)^(n*t)
 *
 * @param principal 初始本金
 * @param annualRatePercent 年利率（%）
 * @param compoundsPerYear 每年复利次数（如月度=12）
 * @param years 投资年限
 * @returns 到期总额（本金 + 利息）
 */
export function calculateCompoundInterest(
  principal: number,
  annualRatePercent: number,
  compoundsPerYear: number,
  years: number
): number {
  const r = percentToDecimal(annualRatePercent);
  return principal * Math.pow(1 + r / compoundsPerYear, compoundsPerYear * years);
}

/**
 * 定投复利（每期追加等额资金，期末一次性计算）
 * 简化版：假设每期投入发生在期末。
 *
 * @param principal 初始本金
 * @param periodicContribution 每期追加金额
 * @param annualRatePercent 年利率（%）
 * @param periodsPerYear 每年期数
 * @param years 总年限
 */
export function calculateRecurringInvestment(
  principal: number,
  periodicContribution: number,
  annualRatePercent: number,
  periodsPerYear: number,
  years: number
): { futureValue: number; totalContributions: number; totalInterest: number } {
  const r = percentToDecimal(annualRatePercent) / periodsPerYear;
  const n = periodsPerYear * years;

  // 初始本金部分
  const principalFv = principal * Math.pow(1 + r, n);

  // 定投部分（普通年金终值）
  let contributionFv = 0;
  if (r === 0) {
    contributionFv = periodicContribution * n;
  } else {
    contributionFv = periodicContribution * ((Math.pow(1 + r, n) - 1) / r);
  }

  const futureValue = principalFv + contributionFv;
  const totalContributions = principal + periodicContribution * n;
  const totalInterest = futureValue - totalContributions;

  return { futureValue, totalContributions, totalInterest };
}

/**
 * 退休金估算
 *
 * 计算从当前年龄到退休年龄、退休后能维持多少年的钱
 *
 * @param currentAge 当前年龄
 * @param retirementAge 退休年龄
 * @param currentSavings 当前已储蓄金额
 * @param monthlyContribution 每月追加投入
 * @param annualReturnPercent 年化收益率（%）
 * @param yearsInRetirement 退休后预期年限
 * @param annualWithdrawalRatePercent 退休后年提取率（如 4%）
 */
export function calculateRetirement(
  currentAge: number,
  retirementAge: number,
  currentSavings: number,
  monthlyContribution: number,
  annualReturnPercent: number,
  yearsInRetirement: number,
  annualWithdrawalRatePercent: number
): {
  nestEgg: number; // 退休时账户总额
  totalContributions: number;
  totalInterest: number;
  monthlyRetirementIncome: number; // 退休后月收入（按提取率估算）
  yearsUntilRetirement: number;
} {
  const yearsUntilRetirement = retirementAge - currentAge;
  if (yearsUntilRetirement <= 0) {
    return {
      nestEgg: currentSavings,
      totalContributions: currentSavings,
      totalInterest: 0,
      monthlyRetirementIncome: (currentSavings * percentToDecimal(annualWithdrawalRatePercent)) / 12,
      yearsUntilRetirement: 0,
    };
  }

  const { futureValue, totalContributions, totalInterest } = calculateRecurringInvestment(
    currentSavings,
    monthlyContribution,
    annualReturnPercent,
    12,
    yearsUntilRetirement
  );

  const monthlyRetirementIncome =
    (futureValue * percentToDecimal(annualWithdrawalRatePercent)) / 12;

  return {
    nestEgg: futureValue,
    totalContributions,
    totalInterest,
    monthlyRetirementIncome,
    yearsUntilRetirement,
  };
}

/* ============================================================
   格式化工具
   ============================================================ */

/** 格式化为美元货币字符串 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  maximumFractionDigits: number = 2
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(amount);
}

/** 格式化为千分位数字字符串 */
export function formatNumber(amount: number, fractionDigits: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

/** 把用户输入的字符串解析成数字（容错：去 $、,、空白） */
export function parseNumberInput(value: string): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value).replace(/[$,\s]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}
