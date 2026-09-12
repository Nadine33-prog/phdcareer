# 澄径 · 融合 Cadmus

全站设计预览：`/dev/design`。色与材质以 [Cadmus](https://land-book.com/websites/88125-uplifting-assessment-cadmus) 为主；版式按页融合 Incite / Frontify / VCASS / Princeton。

现网 token 尚未切换，等你过稿后再落到生产页。

## 文案语言

全站面向用户的文字一律使用**简体中文**。不要写繁体。品牌英文专名（Beyond Academia、JOB ATLAS 等）可保留。

## 气质

学术评估产品的可信感 + 博士去向决策。酒红权威，奶油纸感，照片只用「研究 / 产业 / 政策 / 出路」四类场景。

## 色板（设计稿 · Cadmus）

| Token | Hex | 用途 |
|---|---|---|
| `cadmus-wine` | `#5B0D1C` | Hero、页脚、主按钮、后台侧栏 |
| `cadmus-soft` / `deep` | `#541123` / `#3A0E16` | 悬停、最深文字 |
| `cadmus-cream` | `#F6F0EB` | 页面底 |
| `cadmus-sand` / `blush` / `sage` | `#F9EAD0` / `#EEC3AF` / `#E1E3A2` | 分区、标签、结果卡 |
| `cadmus-bronze` | `#A16B3E` | kicker、辅强调 |
| `cadmus-stone` / `bark` | `#CDC9C6` / `#512818` | 线、次级文字 |

图表色见 `src/styles/chartColors.ts`，与上表对齐。

## 字体

- **Display / 标题**：`Crimson Pro` + `Noto Serif SC`
- **UI / 正文**：`Atkinson Hyperlegible` + `Noto Sans SC`
- **数字 / 代码**：`JetBrains Mono`（按需）

层级建议：页面主标题 40–56px 衬线；章节 28–32px 衬线；正文 14.5–16px 无衬线；辅助 12–13px。

## 形状与阴影

- 控件：`rounded-lg`
- 卡片 / 面板：`rounded-xl`
- 阴影：`shadow-card`，悬停用 `shadow-card-hover` + `.hover-lift`
- 禁用大圆角 pill 堆叠、多层 glow、装饰贴纸

## 动效

- 入场：`.fade-up` / `.page-enter`
- 卡片：`.hover-lift`
- 尊重 `prefers-reduced-motion`

## 展示范式

| 场景 | 范式 | 出现位置 |
|---|---|---|
| 浏览 | 卡片网格 | 职业地图、岗位列表、工具入口 |
| 详情 | 阅读主栏 + 侧栏 CTA | 分类详情、岗位详情 |
| 工具 | 步骤条 → 表单 → 结果看板 | 门槛 / 预警 / 评估 |
| 数据 | Tab + 图表主视觉 | Insights |
| 后台 | PageHeader + Toolbar + DataTable + Drawer | `/admin/*` |

## 组件入口

`src/components/ui`：`Button` `Card` `Field` `Input` `Select` `Textarea` `Badge` `Tabs` `Breadcrumb` `EmptyState` `PageShell` `DataTable` `Stepper` `Metric` `Modal` `Drawer` `BrandMark`

预览（验收后可删）：`/dev/ui`

## Do / Don't

**Do**

- 用 token 名，不写散落 hex
- 一个页面一个主 CTA，accent 只作点缀
- 后台比前台更密：更小字号、更紧行高、粘性表头

**Don't**

- 紫白渐变、陶土奶油、暗黑优先、emoji 插画墙
- 每页自创一套卡片或表格 class
- 为了好看改路由、字段或算法
