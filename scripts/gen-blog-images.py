"""
批量生成 blog 文章配图
- 数据图表：matplotlib，深蓝品牌色
- 头图：Pillow，1200×630 深蓝渐变
"""
import os
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from matplotlib.patches import FancyBboxPatch
from PIL import Image, ImageDraw, ImageFont
import numpy as np

OUT = "public/blog"
os.makedirs(OUT, exist_ok=True)

# 品牌色
BRAND_DARK = "#1e3a8a"
BRAND = "#1d4ed8"
BRAND_LIGHT = "#3b82f6"
ACCENT = "#f59e0b"  # amber
DANGER = "#dc2626"
SUCCESS = "#059669"
BG = "#ffffff"
TEXT = "#1f2937"
MUTED = "#6b7280"

# matplotlib 全局风格
plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 12,
    "axes.edgecolor": MUTED,
    "axes.labelcolor": TEXT,
    "xtick.color": TEXT,
    "ytick.color": TEXT,
    "axes.spines.top": False,
    "axes.spines.right": False,
})


def save_fig(fig, name, dpi=150):
    path = f"{OUT}/{name}.png"
    fig.savefig(path, dpi=dpi, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    size_kb = os.path.getsize(path) // 1024
    print(f"  ✅ {name}.png ({size_kb} KB)")


# ============================================================
# 图表 1：15 vs 30 年房贷总利息对比（文章 1）
# $300k 贷款 @ 6%
# ============================================================
def chart_mortgage_comparison():
    principal = 300000
    rate = 6.0

    def monthly(p, r, y):
        r = r / 100 / 12
        n = y * 12
        f = (1 + r) ** n
        return p * r * f / (f - 1)

    m15 = monthly(principal, rate - 0.5, 15)  # 15 年利率通常低 0.5%
    m30 = monthly(principal, rate, 30)

    interest_15 = m15 * 180 - principal
    interest_30 = m30 * 360 - principal
    payment_15 = m15
    payment_30 = m30

    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 4.5))

    # 左图：月供对比
    bars1 = ax1.bar(["15-year", "30-year"], [payment_15, payment_30],
                    color=[BRAND, BRAND_LIGHT], width=0.55, edgecolor="white", linewidth=2)
    ax1.set_title("Monthly Payment", fontsize=14, fontweight="bold", color=TEXT, pad=12)
    ax1.set_ylabel("Monthly payment (USD)")
    ax1.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x:,.0f}"))
    ax1.set_ylim(0, max(payment_15, payment_30) * 1.25)
    for bar, val in zip(bars1, [payment_15, payment_30]):
        ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() * 1.04,
                 f"${val:,.0f}", ha="center", fontweight="bold", color=TEXT)

    # 右图：总利息对比
    bars2 = ax2.bar(["15-year", "30-year"], [interest_15, interest_30],
                    color=[SUCCESS, DANGER], width=0.55, edgecolor="white", linewidth=2)
    ax2.set_title("Total Interest Paid", fontsize=14, fontweight="bold", color=TEXT, pad=12)
    ax2.set_ylabel("Total interest (USD)")
    ax2.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x/1000:.0f}k"))
    ax2.set_ylim(0, interest_30 * 1.2)
    for bar, val in zip(bars2, [interest_15, interest_30]):
        ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() * 1.04,
                 f"${val:,.0f}", ha="center", fontweight="bold", color=TEXT)

    fig.suptitle("$300,000 mortgage @ 6% — 15-year vs 30-year",
                 fontsize=13, color=MUTED, y=1.02)
    fig.tight_layout()
    save_fig(fig, "mortgage-15-vs-30")


# ============================================================
# 图表 2：复利增长曲线（文章 2）
# $10k 初始，不同年化收益 10/20/30 年
# ============================================================
def chart_compound_growth():
    principal = 10000
    years = np.arange(0, 31)
    rates = [(4, "4% (savings)", BRAND_LIGHT),
             (7, "7% (balanced)", BRAND),
             (10, "10% (S&P 500)", ACCENT)]

    fig, ax = plt.subplots(figsize=(10, 5))
    for rate, label, color in rates:
        values = principal * (1 + rate / 100) ** years
        ax.plot(years, values, linewidth=2.5, color=color, label=label)
        ax.fill_between(years, 0, values, alpha=0.08, color=color)

    ax.set_xlabel("Years")
    ax.set_ylabel("Account value (USD)")
    ax.set_title("$10,000 invested at different annual returns",
                 fontsize=14, fontweight="bold", color=TEXT, pad=12)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f"${x/1000:.0f}k"))
    ax.legend(loc="upper left", frameon=False, fontsize=11)
    ax.set_xlim(0, 30)
    ax.set_ylim(0, 180000)
    ax.grid(True, alpha=0.2, color=MUTED)

    # 标注 30 年终点
    for rate, label, color in rates:
        val = principal * (1 + rate / 100) ** 30
        ax.annotate(f"${val/1000:.0f}k", xy=(30, val),
                    xytext=(8, 0), textcoords="offset points",
                    color=color, fontweight="bold", fontsize=10, va="center")

    fig.tight_layout()
    save_fig(fig, "compound-growth")


# ============================================================
# 图表 3：信用卡还款 - 月供 vs 还清时间（文章 3）
# $5000 余额 @ 20% APR
# ============================================================
def chart_credit_card_payoff():
    balance = 5000
    apr = 20
    r = apr / 100 / 12

    payments = [100, 150, 200, 250, 300, 400]
    months_list = []
    interest_list = []
    for pay in payments:
        cur = balance
        total = 0
        m = 0
        while cur > 0.005 and m < 1200:
            interest = cur * r
            payment = min(pay, cur + interest)
            cur -= payment - interest
            total += payment
            m += 1
        months_list.append(m if m < 1200 else 600)
        interest_list.append(total - balance if m < 1200 else 99999)

    fig, ax = plt.subplots(figsize=(10, 5))
    colors = [DANGER if m >= 120 else ACCENT if m >= 36 else SUCCESS for m in months_list]
    bars = ax.bar([f"${p}" for p in payments], months_list,
                  color=colors, width=0.6, edgecolor="white", linewidth=2)

    ax.set_xlabel("Monthly payment")
    ax.set_ylabel("Months to pay off")
    ax.set_title("$5,000 credit card debt @ 20% APR — time to debt-free",
                 fontsize=13, fontweight="bold", color=TEXT, pad=12)
    ax.set_ylim(0, max(months_list) * 1.2)

    for bar, m, interest in zip(bars, months_list, interest_list):
        if interest >= 99999:
            label = "Never"
        elif m >= 24:
            label = f"{m//12}y {m%12}mo\n${interest:,.0f} interest"
        else:
            label = f"{m} mo\n${interest:,.0f} interest"
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() * 1.03,
                label, ha="center", va="bottom", fontsize=9, color=TEXT)

    ax.axhline(y=120, color=MUTED, linestyle="--", alpha=0.5, linewidth=1)
    ax.text(5.5, 125, "10 years", color=MUTED, fontsize=9, ha="right")

    fig.tight_layout()
    save_fig(fig, "credit-card-payoff")


# ============================================================
# 头图生成器（1200×630 深蓝品牌风）
# ============================================================
def make_hero(slug, title, subtitle, icon_text="$"):
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), (30, 58, 138))
    draw = ImageDraw.Draw(img)

    # 对角渐变
    for y in range(H):
        for x in range(0, W, 4):
            t = (x / W + y / H) / 2
            r = int(23 + (23 - 15) * t)
            g = int(58 + (37 - 58) * t)
            b = int(138 + (84 - 138) * t)
            draw.rectangle([x, y, x + 3, y], fill=(r, g, b))

    # 右侧光晕
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    for rad, alpha in [(400, 15), (300, 20), (200, 25)]:
        odraw.ellipse([W - rad - 50, -rad // 2, W + 50, rad], fill=(96, 165, 250, alpha))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    def font(size, bold=True):
        paths = ["/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold
                 else "/System/Library/Fonts/Supplemental/Arial.ttf",
                 "/System/Library/Fonts/Helvetica.ttc"]
        for p in paths:
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, size)
                except Exception:
                    pass
        return ImageFont.load_default()

    # Badge
    badge_font = font(22, True)
    badge_text = "FINCALC HUB · GUIDE"
    bbox = draw.textbbox((0, 0), badge_text, font=badge_font)
    bw, bh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.rounded_rectangle([80, 70, 80 + bw + 40, 70 + bh + 24], radius=20,
                           fill=(255, 255, 255), outline=(147, 197, 253))
    draw.text((100, 80), badge_text, font=badge_font, fill=(30, 58, 138))

    # 主标题（自动换行）
    title_font = font(64, True)
    sub_font = font(28, False)
    # 简单换行：每行约 22 字符
    words = title.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if len(test) > 22 and cur:
            lines.append(cur)
            cur = w
        else:
            cur = test
    if cur:
        lines.append(cur)

    y = 200
    for line in lines[:3]:
        draw.text((80, y), line, font=title_font, fill=(255, 255, 255))
        y += 76

    # 副标题
    draw.text((84, y + 10), subtitle, font=sub_font, fill=(191, 219, 254))

    # 右下大符号
    big_font = font(260, True)
    draw.text((940, 280), icon_text, font=big_font, fill=(59, 130, 246, 80))

    path = f"{OUT}/{slug}.png"
    img.save(path, "PNG", optimize=True)
    print(f"  ✅ {slug}.png ({os.path.getsize(path)//1024} KB)")


# ============================================================
# 生成所有图片
# ============================================================
print("生成数据图表...")
chart_mortgage_comparison()
chart_compound_growth()
chart_credit_card_payoff()

print("\n生成头图...")
make_hero("hero-15-vs-30-mortgage",
          "15 vs 30 Year Mortgage",
          "Which saves you more money?", "🏠")
make_hero("hero-compound-interest",
          "What Is Compound Interest?",
          "The eighth wonder of the world, explained", "📈")
make_hero("hero-credit-card-payoff",
          "Pay Off Credit Card Debt",
          "A step-by-step strategy that works", "💳")

print("\n✅ 全部图片生成完成")
print(f"   目录: {OUT}/")
for f in sorted(os.listdir(OUT)):
    size = os.path.getsize(f"{OUT}/{f}") // 1024
    print(f"   {f} ({size} KB)")
