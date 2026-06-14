# FinCalc Hub — 金融计算器集合站

> 目标：通过 SEO 获取海外流量，挂 Google AdSense 变现。
> 技术栈：**Astro + React 岛屿 + TailwindCSS v4**，纯静态输出，部署到 **Cloudflare Pages**（免费）。

---

## 一、项目概览

| 项目 | 详情 |
|------|------|
| **首批计算器** | Mortgage / Loan / Compound Interest / Retirement / Auto Loan |
| **核心变现** | Google AdSense（金融类 CPC 最高，$5–10/次点击） |
| **托管成本** | 0 元（Cloudflare Pages 免费额度足够） |
| **域名成本** | 约 30–60 元/年（推荐 Cloudflare 注册 .com） |

---

## 二、目录结构

```
src/
├── components/
│   ├── layout/         # Header / Footer / AdSlot
│   ├── ui/             # Seo / CalculatorCard / PageContent
│   └── calculators/    # 5 个 React 计算器 + 共享 UI + 相关计算器
├── data/
│   └── calculators.ts  # 计算器元数据（新增计算器只需在此添加）
├── lib/
│   ├── finance.ts      # 金融公式（月供/复利/摊销/退休/格式化）
│   └── finance.test.mjs# 公式正确性验证脚本（27 个用例）
├── layouts/
│   └── BaseLayout.astro
├── pages/
│   ├── index.astro              # 首页（5 个计算器卡片）
│   ├── about.astro / contact.astro
│   ├── privacy-policy.astro     # AdSense 必需
│   ├── terms-of-service.astro   # AdSense 必需
│   ├── 404.astro
│   └── calculators/             # 5 个计算器落地页
└── styles/
    └── global.css               # Tailwind v4 + 主题色 + 字体
```

---

## 三、本地开发

### 环境要求
- Node.js ≥ 22.12（项目已用 Node 24 验证）
- pnpm（推荐）或 npm

### 安装与启动
```bash
pnpm install        # 安装依赖
pnpm dev            # 启动开发服务器 → http://localhost:4321
```

### 验证金融公式正确性
```bash
node --experimental-strip-types src/lib/finance.test.mjs
```
预期输出：`27 passed, 0 failed`。

> 测试脚本中的 expected 值已经过 **Python Decimal 50 位精度独立计算验证**。

### 生产构建
```bash
pnpm build          # 输出到 dist/，纯静态
pnpm preview        # 本地预览生产构建
```

---

## 四、部署到 Cloudflare Pages

### 步骤 1：注册域名（一次性）
- 推荐 **Cloudflare Registrar**（无加价）或 **Porkbun**（首年便宜）
- 买一个 `.com` 域名，约 $8/年

### 步骤 2：把代码推到 GitHub
```bash
git init
git add .
git commit -m "Initial commit: FinCalc Hub"
# 创建 GitHub 仓库后
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

### 步骤 3：连接 Cloudflare Pages
1. 登录 https://dash.cloudflare.com → Pages → Create a project
2. 选择 **Connect to Git** → 授权并选你的仓库
3. 填写构建设置：
   - **Framework preset**: Astro
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Environment variables**: `NODE_VERSION` = `22`（或更高）
4. 点击 **Save and Deploy**

### 步骤 4：绑定自定义域名
- Pages 项目 → Custom domains → Set up a domain → 输入你的域名
- 按提示在域名 DNS 添加 CNAME（如果域名也在 Cloudflare，自动配置）

### 步骤 5：更新站点 URL
部署成功后，编辑 `astro.config.mjs`，把 `site` 字段改成你的真实域名：
```js
site: 'https://your-domain.com',
```
同时编辑 `public/robots.txt` 中的 Sitemap URL。重新部署。

---

## 五、接入 Google AdSense（流量达标后）

### 申请门槛（经验值）
- **内容数量**：至少 20–30 个高质量页面（本项目首期 10 个，需继续扩展）
- **流量**：月 UV ≥ 100–500（不同账号审核松紧不同）
- **运行时间**：建议域名 ≥ 2 周以上再申请

### 接入步骤
1. 注册 https://www.google.com/adsense
2. 添加网站，下载 `ads.txt`，放到 `public/ads.txt`
3. 通过审核后，把 publisher ID（`ca-pub-XXXXX`）填入：
   - 项目根目录新建 `.env` 文件（参考 `.env.example`）：
     ```
     PUBLIC_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX
     ```
4. 在 AdSense 后台创建广告单元，把 `data-ad-slot` ID 填到需要的位置（使用 `<AdSlot slot="..." />`）
5. 重新部署

### AdSense 审核注意
- 法律页（Privacy/Terms）必须存在且含 AdSense/Google Cookies 说明 ✅ 已包含
- 每个页面要有实质性内容（本项目每个计算器页都有 FAQ + 使用说明）✅ 已满足
- 禁止 AI 生成的水文（本项目内容为人工撰写）✅ 已满足

---

## 六、SEO 优化清单（已实现）

- ✅ 每页独立 title / description / canonical
- ✅ Open Graph + Twitter Card
- ✅ JSON-LD 结构化数据（WebApplication + FAQPage）
- ✅ 自动 sitemap.xml（`@astrojs/sitemap`）
- ✅ robots.txt
- ✅ 语义化 HTML（h1/h2/h3、nav、main、article）
- ✅ 内链建设（首页 → 计算器 → 相关计算器）
- ✅ 移动端响应式
- ✅ 静态导出（Core Web Vitals 友好）

### 后续建议（未实现）
- [ ] 添加 `og-default.png`（1200×630 社交分享图）放到 `public/`
- [ ] 接入 Google Search Console 提交 sitemap
- [ ] 添加更多计算器（推荐：Tax、Savings Goal、Credit Card Payoff）
- [ ] 增加 blog 内容区（用 Astro Content Collections）
- [ ] 添加 BreadcrumbList 结构化数据

---

## 七、常用命令速查

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 生产构建到 `dist/` |
| `pnpm preview` | 预览生产构建 |
| `pnpm astro check` | TypeScript + Astro 类型检查 |
| `node --experimental-strip-types src/lib/finance.test.mjs` | 跑金融公式测试 |

---

## 八、技术决策说明

### 为什么用 Astro 而不是 Next.js？
- 金融计算器站本质是"大量 SEO 落地页 + 少量交互"，Astro 默认零 JS 最适合
- 构建产物是纯静态 HTML，加载极快，Core Web Vitals 分数高
- React 岛屿只在需要交互的计算器组件按需 hydrate

### 为什么 Tailwind v4？
- 最新版用 Vite 插件模式，无需 `tailwind.config.js`，配置更简洁
- 主题色直接在 `global.css` 里用 `@theme` 定义

### 为什么不接 AdSense 自动广告？
- 自动广告可能插入不雅位置，影响用户体验和过审
- 手动用 `<AdSlot />` 控制广告位置，更可控

---

## 九、运维与监控

部署后建议接入：
1. **Google Search Console** — 监控索引和关键词排名
2. **Google Analytics 4**（或 Cloudflare Web Analytics 免费版）— 流量分析
3. **Cloudflare 自带** — 安全防护、DDoS 防御（免费）

---

## 十、联系方式

部署遇到问题或想扩展新功能，可以基于这个 README 继续开发。
祝早日 AdSense 收益破千 💰
