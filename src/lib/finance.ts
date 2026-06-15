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
   信用卡还款
   ============================================================ */

/**
 * 按固定月供算还清时间（信用卡最低还款用不到，这里用于"加速还款"场景）
 *
 * 每月余额 = 上月余额 * (1+r) - 月供
 * 迭代到余额 ≤ 0
 *
 * @param balance 当前余额
 * @param annualRatePercent 年利率（信用卡通常 15-25%，按日息计这里简化为月复利）
 * @param monthlyPayment 固定月供（必须 > 月利息，否则永远还不清）
 */
export function calculateCreditCardPayoff(
  balance: number,
  annualRatePercent: number,
  monthlyPayment: number
): {
  months: number;
  totalPaid: number;
  totalInterest: number;
  /** 是否能还清（月供 < 月利息时为 false） */
  canPayOff: boolean;
} {
  const r = percentToDecimal(annualRatePercent) / 12;
  const minMonthlyInterest = balance * r;

  // 月供 <= 月利息：永远还不清
  if (monthlyPayment <= minMonthlyInterest) {
    return { months: Infinity, totalPaid: Infinity, totalInterest: Infinity, canPayOff: false };
  }

  let currentBalance = balance;
  let totalPaid = 0;
  let months = 0;

  // 防止无限循环（最多 1200 个月 = 100 年）
  while (currentBalance > 0.005 && months < 1200) {
    const interest = currentBalance * r;
    // 最后一期：月供 = 余额 + 利息
    const payment = Math.min(monthlyPayment, currentBalance + interest);
    currentBalance -= payment - interest;
    totalPaid += payment;
    months++;
  }

  return {
    months,
    totalPaid,
    totalInterest: totalPaid - balance,
    canPayOff: true,
  };
}

/**
 * 按目标还清月数，算所需月供
 *
 * 解 M = B * r / (1 - (1+r)^-n)（即等额本息月供公式的反解）
 */
export function calculatePaymentForPayoff(
  balance: number,
  annualRatePercent: number,
  months: number
): number {
  const r = percentToDecimal(annualRatePercent) / 12;
  if (months <= 0) return 0;
  if (r === 0) return balance / months;
  return (balance * r) / (1 - Math.pow(1 + r, -months));
}

/* ============================================================
   储蓄目标
   ============================================================ */

/**
 * 给定目标金额 + 期限，算每月需要存多少
 *
 * 反解普通年金公式：PMT = (FV * r) / ((1+r)^n - 1)
 *
 * @param targetAmount 目标金额
 * @param currentSavings 当前已储蓄
 * @param annualRatePercent 年化收益率（%）
 * @param months 目标月数
 */
export function calculateSavingsGoal(
  targetAmount: number,
  currentSavings: number,
  annualRatePercent: number,
  months: number
): {
  monthlyContribution: number;
  /** 当前储蓄到期时的终值 */
  currentSavingsFv: number;
  /** 总投入（含当前储蓄） */
  totalContributions: number;
  totalInterest: number;
} {
  const r = percentToDecimal(annualRatePercent) / 12;
  // 当前储蓄到期时的终值
  const currentSavingsFv = currentSavings * Math.pow(1 + r, months);
  // 还需要靠月存达到的金额
  const remainingTarget = Math.max(0, targetAmount - currentSavingsFv);

  let monthlyContribution: number;
  if (months <= 0) {
    monthlyContribution = remainingTarget;
  } else if (r === 0) {
    monthlyContribution = remainingTarget / months;
  } else {
    monthlyContribution = (remainingTarget * r) / (Math.pow(1 + r, months) - 1);
  }

  const totalContributions = currentSavings + monthlyContribution * months;
  const totalInterest = targetAmount - totalContributions;

  return {
    monthlyContribution,
    currentSavingsFv,
    totalContributions,
    totalInterest,
  };
}

/* ============================================================
   投资回报率 ROI
   ============================================================ */

/**
 * 简单 ROI 百分比
 *
 * ROI = (收益 - 成本) / 成本 * 100
 *
 * @param initialInvestment 初始投入
 * @param finalValue 期末价值
 * @param years 持有年限（用于计算年化）
 */
export function calculateROI(
  initialInvestment: number,
  finalValue: number,
  years: number
): {
  totalReturn: number; // 绝对收益（金额）
  roiPercent: number; // 总 ROI %
  /** 年化 ROI（CAGR） */
  annualizedRoiPercent: number;
} {
  if (initialInvestment <= 0) {
    return { totalReturn: 0, roiPercent: 0, annualizedRoiPercent: 0 };
  }
  const totalReturn = finalValue - initialInvestment;
  const roiPercent = (totalReturn / initialInvestment) * 100;
  // CAGR = (FV/PV)^(1/n) - 1
  const annualizedRoiPercent =
    years > 0 ? (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100 : 0;

  return { totalReturn, roiPercent, annualizedRoiPercent };
}

/* ============================================================
   APR 真实年化利率（含费用）
   ============================================================ */

/**
 * 计算含费用后的真实 APR
 *
 * 通过牛顿迭代法求利率，使按月供还清 (principal + fees) 的现值等于 (principal - fees)
 *
 * @param principal 贷款本金
 * @param fees 贷款费用（手续费、点数等，从本金中扣除）
 * @param nominalRatePercent 名义年利率（%）
 * @param years 贷款年限
 */
export function calculateAPR(
  principal: number,
  fees: number,
  nominalRatePercent: number,
  years: number
): {
  aprPercent: number;
  monthlyPayment: number;
  /** 实际到手金额 */
  netAmount: number;
} {
  const n = years * 12;
  const monthlyPayment = calculateMonthlyPayment(principal, nominalRatePercent, years);
  // 实际到手 = 本金 - 费用
  const netAmount = principal - fees;

  if (netAmount <= 0 || n <= 0 || monthlyPayment <= 0) {
    return { aprPercent: nominalRatePercent, monthlyPayment, netAmount };
  }

  // 牛顿迭代求解月利率 r，使得：
  // netAmount = monthlyPayment * (1 - (1+r)^-n) / r
  // 用二分法更稳健
  let low = 0;
  let high = 0.5; // 月利率上限 50%（年化 600%，足够）
  let mid = 0;
  for (let i = 0; i < 100; i++) {
    mid = (low + high) / 2;
    const factor = Math.pow(1 + mid, n);
    const pv = mid === 0 ? monthlyPayment * n : monthlyPayment * (1 - 1 / factor) / mid;
    if (pv > netAmount) {
      low = mid;
    } else {
      high = mid;
    }
  }
  const aprPercent = mid * 12 * 100;
  return { aprPercent, monthlyPayment, netAmount };
}

/* ============================================================
   贷款对比
   ============================================================ */

export interface LoanOption {
  /** 选项名 */
  label: string;
  /** 贷款金额 */
  principal: number;
  /** 年利率 % */
  annualRatePercent: number;
  /** 年限 */
  years: number;
  /** 一次性费用（如手续费） */
  fees?: number;
}

export interface LoanComparisonResult {
  option: LoanOption;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  /** 含费用后真实 APR */
  aprPercent: number;
}

/**
 * 对比多个贷款方案，返回每个的月供、总利息、APR
 */
export function compareLoans(options: LoanOption[]): LoanComparisonResult[] {
  return options.map((option) => {
    const monthlyPayment = calculateMonthlyPayment(
      option.principal,
      option.annualRatePercent,
      option.years
    );
    const totalPaid = monthlyPayment * option.years * 12;
    const totalInterest = Math.max(0, totalPaid - option.principal);
    const { aprPercent } = calculateAPR(
      option.principal,
      option.fees ?? 0,
      option.annualRatePercent,
      option.years
    );
    return { option, monthlyPayment, totalPaid, totalInterest, aprPercent };
  });
}

/* ============================================================
   工资换算（年薪 / 时薪 / 月薪 / 周薪）
   ============================================================ */

/**
 * 工资换算：给定任一输入，推算所有其它单位
 *
 * 默认假设：每年工作 52 周，每月 12 个月。
 * 双周 = 每两周发一次薪，每年 26 个发薪周期。
 *
 * @param hourlyRate 时薪
 * @param hoursPerWeek 每周工时（默认 40）
 */
export function calculateSalary(
  hourlyRate: number,
  hoursPerWeek: number = 40
): {
  hourly: number;
  weekly: number;
  biweekly: number;
  semiMonthly: number;
  monthly: number;
  annual: number;
} {
  const weekly = hourlyRate * hoursPerWeek;
  const annual = weekly * 52;
  return {
    hourly: hourlyRate,
    weekly,
    biweekly: weekly * 2,
    semiMonthly: annual / 24,
    monthly: annual / 12,
    annual,
  };
}

/** 反向：从年薪算出时薪 */
export function annualToHourly(
  annualSalary: number,
  hoursPerWeek: number = 40
): number {
  return annualSalary / (hoursPerWeek * 52);
}

/* ============================================================
   通货膨胀（购买力换算）
   ============================================================ */

/**
 * 计算通胀对未来购买力的侵蚀
 *
 * 未来需要多少钱，才能等价于今天的 X 元
 *
 * FV = PV * (1 + i)^n
 *
 * @param presentValue 今天的金额
 * @param inflationRatePercent 年通胀率（%，如 3 表示 3%）
 * @param years 年数
 */
export function calculateInflation(
  presentValue: number,
  inflationRatePercent: number,
  years: number
): {
  futureValue: number; // 名义上需要的金额
  purchasingPower: number; // 今天 X 元在 n 年后的实际购买力
  totalInflation: number; // 累计价格涨幅（金额）
} {
  const i = percentToDecimal(inflationRatePercent);
  const factor = Math.pow(1 + i, years);
  const futureValue = presentValue * factor;
  // 今天的 X 元，n 年后实际购买力
  const purchasingPower = presentValue / factor;
  const totalInflation = futureValue - presentValue;
  return { futureValue, purchasingPower, totalInflation };
}

/** 历史通胀回算：过去的 $X 等于今天的多少 */
export function calculateHistoricalInflation(
  historicalAmount: number,
  inflationRatePercent: number,
  yearsAgo: number
): number {
  return calculateInflation(historicalAmount, inflationRatePercent, yearsAgo).futureValue;
}

/* ============================================================
   通用投资计算（支持初始 + 定投 + 不同频率）
   ============================================================ */

export interface InvestmentResult {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  /** 每年明细（用于趋势展示） */
  yearlyBreakdown: { year: number; balance: number; contributions: number; interest: number }[];
}

/**
 * 通用投资终值（一次性本金 + 定期追加）
 *
 * @param initialInvestment 初始本金
 * @param periodicContribution 每期追加金额
 * @param annualRatePercent 年化收益率 %
 * @param periodsPerYear 每年期数（月=12，年=1）
 * @param years 投资年限
 */
export function calculateInvestment(
  initialInvestment: number,
  periodicContribution: number,
  annualRatePercent: number,
  periodsPerYear: number,
  years: number
): InvestmentResult {
  const r = percentToDecimal(annualRatePercent) / periodsPerYear;
  const totalPeriods = periodsPerYear * years;

  const yearlyBreakdown: InvestmentResult["yearlyBreakdown"] = [];
  let balance = initialInvestment;
  let totalContributions = initialInvestment;
  let totalInterest = 0;

  for (let period = 1; period <= totalPeriods; period++) {
    const interest = balance * r;
    balance += interest + periodicContribution;
    totalContributions += periodicContribution;
    totalInterest += interest;

    // 每年记录一次
    if (period % periodsPerYear === 0) {
      yearlyBreakdown.push({
        year: period / periodsPerYear,
        balance,
        contributions: totalContributions,
        interest: totalInterest,
      });
    }
  }

  return {
    futureValue: balance,
    totalContributions,
    totalInterest,
    yearlyBreakdown,
  };
}

/* ============================================================
   定期存款 CD
   ============================================================ */

/**
 * CD（定期存款）到期收益
 *
 * APY 公式：APY = (1 + r/n)^n - 1
 *
 * @param principal 本金
 * @param apyPercent 年化收益率（APY %，银行通常直接标 APY）
 * @param years CD 期限（年，支持 0.5 表示 6 个月）
 * @param compoundsPerYear 每年复利次数（默认 365 = 日复利，银行常用）
 */
export function calculateCD(
  principal: number,
  apyPercent: number,
  years: number,
  compoundsPerYear: number = 365
): {
  finalValue: number;
  totalInterest: number;
  /** 等效年化收益率（已含复利） */
  effectiveApy: number;
} {
  const r = percentToDecimal(apyPercent);
  const finalValue =
    principal * Math.pow(1 + r / compoundsPerYear, compoundsPerYear * years);
  const totalInterest = finalValue - principal;
  // 有效 APY（已是 apyPercent，这里复算确认）
  const effectiveApy = (Math.pow(1 + r / compoundsPerYear, compoundsPerYear) - 1) * 100;
  return { finalValue, totalInterest, effectiveApy };
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
