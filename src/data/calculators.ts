/**
 * calculators.ts - 计算器元数据
 *
 * 用于首页卡片渲染、Footer 链接、相关计算器推荐。
 * 新增计算器时只需在此数组添加一项。
 */

export interface CalculatorMeta {
  /** kebab-case URL slug */
  slug: string;
  /** 完整页面路径 */
  path: string;
  /** 卡片显示名 */
  name: string;
  /** 一句话描述 */
  shortDesc: string;
  /** SEO meta description（150 字符内） */
  seoDescription: string;
  /** SVG 图标内嵌（stroke 路径） */
  icon: string;
  /** 图标 emoji 备用 */
  emoji: string;
  /** 卡片背景色（Tailwind 渐变类） */
  accent: string;
}

export const calculators: CalculatorMeta[] = [
  {
    slug: "mortgage-calculator",
    path: "/calculators/mortgage-calculator",
    name: "Mortgage Calculator",
    shortDesc: "Estimate your monthly mortgage payments and full amortization schedule.",
    seoDescription:
      "Free mortgage calculator with monthly payment, total interest, and amortization schedule. Estimate your home loan payments instantly.",
    icon: `<path d="M3 9.5L12 3l9 6.5"/><path d="M5 10v11h14V10"/>`,
    emoji: "🏠",
    accent: "from-blue-500 to-blue-700",
  },
  {
    slug: "loan-calculator",
    path: "/calculators/loan-calculator",
    name: "Loan Calculator",
    shortDesc: "Calculate monthly payments and total interest for any personal loan.",
    seoDescription:
      "Free loan calculator for personal loans. Calculate monthly payments, total interest, and repayment schedules for any loan amount.",
    icon: `<rect x="2" y="6" width="20" height="12" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>`,
    emoji: "💵",
    accent: "from-emerald-500 to-emerald-700",
  },
  {
    slug: "compound-interest-calculator",
    path: "/calculators/compound-interest-calculator",
    name: "Compound Interest Calculator",
    shortDesc: "See how your money grows with the power of compound interest.",
    seoDescription:
      "Free compound interest calculator. See how your savings or investments grow over time with monthly or annual compounding.",
    icon: `<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>`,
    emoji: "📈",
    accent: "from-violet-500 to-violet-700",
  },
  {
    slug: "retirement-calculator",
    path: "/calculators/retirement-calculator",
    name: "Retirement Calculator",
    shortDesc: "Project your retirement savings and monthly income after you stop working.",
    seoDescription:
      "Free retirement calculator. Project your nest egg at retirement, future monthly income, and see if you are on track for your goals.",
    icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    emoji: "🌴",
    accent: "from-amber-500 to-amber-700",
  },
  {
    slug: "auto-loan-calculator",
    path: "/calculators/auto-loan-calculator",
    name: "Auto Loan Calculator",
    shortDesc: "Find your monthly car payment and total cost of financing.",
    seoDescription:
      "Free auto loan calculator. Estimate monthly car payments, total interest, and overall cost for your next vehicle purchase.",
    icon: `<path d="M5 17h14M5 17l1.5-5h11L19 17M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0"/>`,
    emoji: "🚗",
    accent: "from-rose-500 to-rose-700",
  },
  {
    slug: "credit-card-payoff-calculator",
    path: "/calculators/credit-card-payoff-calculator",
    name: "Credit Card Payoff Calculator",
    shortDesc:
      "See how long it takes to clear credit card debt, or find the payment to be debt-free by your goal date.",
    seoDescription:
      "Free credit card payoff calculator. Find your debt-free date, total interest, and the exact monthly payment needed to pay off credit card debt fast.",
    icon: `<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>`,
    emoji: "💳",
    accent: "from-pink-500 to-pink-700",
  },
  {
    slug: "savings-goal-calculator",
    path: "/calculators/savings-goal-calculator",
    name: "Savings Goal Calculator",
    shortDesc:
      "Find out exactly how much to save each month to hit any financial goal on time.",
    seoDescription:
      "Free savings goal calculator. Calculate the monthly contribution needed to reach your savings target, with interest working in your favor.",
    icon: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
    emoji: "🎯",
    accent: "from-emerald-500 to-emerald-700",
  },
  {
    slug: "roi-calculator",
    path: "/calculators/roi-calculator",
    name: "ROI Calculator",
    shortDesc:
      "Measure investment performance: total return and annualized rate (CAGR).",
    seoDescription:
      "Free ROI calculator. Calculate total return on investment and annualized rate (CAGR) for stocks, real estate, business, or any investment.",
    icon: `<polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/>`,
    emoji: "📊",
    accent: "from-indigo-500 to-indigo-700",
  },
  {
    slug: "apr-calculator",
    path: "/calculators/apr-calculator",
    name: "APR Calculator",
    shortDesc:
      "Reveal the true cost of a loan by converting interest plus fees into a single APR.",
    seoDescription:
      "Free APR calculator. Find the true annual percentage rate of any loan, including fees. Compare apples to apples across lenders.",
    icon: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`,
    emoji: "🔍",
    accent: "from-violet-500 to-violet-700",
  },
  {
    slug: "loan-comparison-calculator",
    path: "/calculators/loan-comparison-calculator",
    name: "Loan Comparison Calculator",
    shortDesc:
      "Compare 3 loan offers side-by-side: monthly payment, total cost, and true APR.",
    seoDescription:
      "Free loan comparison calculator. Compare up to 3 loan offers by monthly payment, total interest, true APR, and total cost to find the cheapest option.",
    icon: `<rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/>`,
    emoji: "⚖️",
    accent: "from-cyan-500 to-cyan-700",
  },
  {
    slug: "salary-calculator",
    path: "/calculators/salary-calculator",
    name: "Salary Calculator",
    shortDesc:
      "Convert between hourly wage and annual salary. See your pay in every format.",
    seoDescription:
      "Free salary calculator. Convert hourly wage to annual salary, monthly, weekly, and bi-weekly pay. See your true earnings and estimated take-home pay.",
    icon: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`,
    emoji: "💼",
    accent: "from-indigo-500 to-indigo-700",
  },
  {
    slug: "tip-calculator",
    path: "/calculators/tip-calculator",
    name: "Tip Calculator",
    shortDesc:
      "Calculate the perfect tip and split the bill across any group size.",
    seoDescription:
      "Free tip calculator. Calculate tips for any bill amount, split the total between friends, and customize the tip percentage in seconds.",
    icon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
    emoji: "🍽️",
    accent: "from-emerald-500 to-emerald-700",
  },
  {
    slug: "inflation-calculator",
    path: "/calculators/inflation-calculator",
    name: "Inflation Calculator",
    shortDesc:
      "See how inflation erodes purchasing power and what your money will be worth.",
    seoDescription:
      "Free inflation calculator. Find out how much your money will be worth in the future and how much purchasing power inflation eats away over time.",
    icon: `<polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/>`,
    emoji: "📉",
    accent: "from-rose-500 to-rose-700",
  },
  {
    slug: "investment-calculator",
    path: "/calculators/investment-calculator",
    name: "Investment Calculator",
    shortDesc:
      "Project the future value of your investments with regular contributions.",
    seoDescription:
      "Free investment calculator. Project how much your portfolio will grow with initial capital and monthly contributions, including compound growth charts.",
    icon: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
    emoji: "💰",
    accent: "from-indigo-500 to-indigo-700",
  },
  {
    slug: "cd-calculator",
    path: "/calculators/cd-calculator",
    name: "CD Calculator",
    shortDesc:
      "Calculate interest earned on a Certificate of Deposit at any APY and term.",
    seoDescription:
      "Free CD calculator. Calculate interest earned on a Certificate of Deposit with daily compounding. Compare CD rates and terms from 6 months to 5 years.",
    icon: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
    emoji: "🏦",
    accent: "from-cyan-500 to-cyan-700",
  },
];

/** 按 slug 查找 */
export function getCalculator(slug: string): CalculatorMeta | undefined {
  return calculators.find((c) => c.slug === slug);
}

/** 排除当前页，返回其它计算器（用于"相关计算器"模块） */
export function getRelatedCalculators(currentSlug: string): CalculatorMeta[] {
  return calculators.filter((c) => c.slug !== currentSlug);
}
