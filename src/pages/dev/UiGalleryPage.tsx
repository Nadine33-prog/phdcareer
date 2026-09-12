import { useState } from "react";
import { Compass, FileSearch, Target } from "lucide-react";
import {
  Badge,
  BrandMark,
  Breadcrumb,
  Button,
  Card,
  DataTable,
  Drawer,
  EmptyState,
  Field,
  Input,
  Metric,
  Modal,
  PageHeader,
  PageShell,
  Select,
  Stepper,
  Tabs,
  Textarea,
} from "@/components/ui";

const colors = [
  { name: "primary", swatch: "bg-primary", hex: "#0F2A44" },
  { name: "primary-soft", swatch: "bg-primary-soft", hex: "#1A3F5C" },
  { name: "primary-wash", swatch: "bg-primary-wash", hex: "#E6EEF4" },
  { name: "accent", swatch: "bg-accent", hex: "#0F766E" },
  { name: "accent-soft", swatch: "bg-accent-soft", hex: "#D1FAF4" },
  { name: "bg", swatch: "bg-bg border border-line", hex: "#F4F7FA" },
  { name: "ink", swatch: "bg-ink", hex: "#0F172A" },
  { name: "ink-3", swatch: "bg-ink-3", hex: "#64748B" },
];

const tableRows = [
  { id: "1", name: "学术支撑", jobs: 12, tone: "稳定" },
  { id: "2", name: "科技企业", jobs: 28, tone: "增长" },
  { id: "3", name: "智库政策", jobs: 9, tone: "稳定" },
];

export default function UiGalleryPage() {
  const [tab, setTab] = useState("dest");
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="atmosphere min-h-screen">
      <div className="relative overflow-hidden border-b border-line">
        <div className="scholarly-grid absolute inset-0 opacity-70" aria-hidden="true" />
        <PageShell className="relative py-14 md:py-20">
          <div className="fade-up">
            <BrandMark />
            <p className="mt-8 font-serif text-[11px] font-semibold uppercase tracking-[.24em] text-accent">
              M0 · 澄径设计底
            </p>
            <h1 className="mt-3 font-serif text-[40px] font-semibold leading-[1.1] tracking-[-.015em] text-ink md:text-[52px]">
              组件与色板预览
            </h1>
            <p className="mt-4 max-w-[540px] text-[15px] leading-relaxed text-ink-2">
              临时页，验收后可删。业务路由与逻辑未改。请在桌面与手机各看一遍：色、字、按钮、卡片、表格、分步。
            </p>
          </div>
        </PageShell>
      </div>

      <PageShell className="space-y-16 py-12 md:py-16">
        <section className="fade-up">
          <PageHeader as="h2" kicker="Color" title="色板" description="主色深墨蓝，辅色青绿。语义色只用于达标 / 边缘 / 风险。" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {colors.map((c) => (
              <div key={c.name} className="overflow-hidden rounded-xl border border-line bg-paper shadow-card">
                <div className={cnSwatch(c.swatch)} />
                <div className="px-3 py-2.5">
                  <div className="text-[13px] font-semibold text-ink">{c.name}</div>
                  <div className="font-mono text-[11px] text-ink-3">{c.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <PageHeader as="h2" kicker="Type" title="字体" description="标题衬线，正文与控件无衬线。" />
          <Card>
            <p className="font-serif text-[36px] font-semibold leading-tight text-ink">看见更多可能。</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
              一个面向博士的职业决策平台。把学术训练转化成可比较、可行动的下一步。
            </p>
            <p className="mt-4 font-mono text-[12px] text-ink-3">JetBrains Mono · 38% · 2025</p>
          </Card>
        </section>

        <section>
          <PageHeader as="h2" kicker="Actions" title="按钮" />
          <div className="flex flex-wrap gap-3">
            <Button>开始评估</Button>
            <Button variant="secondary">探索地图</Button>
            <Button variant="ghost">了解更多</Button>
            <Button variant="accent" size="sm">保存</Button>
            <Button disabled>不可用</Button>
          </div>
        </section>

        <section>
          <PageHeader as="h2" kicker="Browse" title="卡片网格" />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Target, title: "学术门槛", desc: "对照目标院校门槛，看见差距与改进项。" },
              { icon: FileSearch, title: "职位预警", desc: "粘贴 JD，识别预聘制与隐形条款。" },
              { icon: Compass, title: "职业评估", desc: "8 分钟匹配 8 类博士去向。" },
            ].map((item) => (
              <Card key={item.title} hover>
                <item.icon size={20} className="text-accent" />
                <h3 className="mt-4 font-serif text-[22px] font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-3">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <PageHeader as="h2" kicker="Form" title="表单控件" />
          <Card className="grid gap-4 md:grid-cols-2">
            <Field label="目标院校" hint="可先填简称">
              <Input placeholder="例如：复旦大学" />
            </Field>
            <Field label="学科门类">
              <Select defaultValue="sci">
                <option value="sci">理工</option>
                <option value="hum">人文社科</option>
              </Select>
            </Field>
            <Field label="职位描述" className="md:col-span-2">
              <Textarea placeholder="粘贴招聘 JD…" />
            </Field>
          </Card>
        </section>

        <section>
          <PageHeader as="h2" kicker="Signals" title="徽章与指标" />
          <div className="mb-6 flex flex-wrap gap-2">
            <Badge>分类</Badge>
            <Badge tone="accent">路径</Badge>
            <Badge tone="success">达标</Badge>
            <Badge tone="warn">边缘</Badge>
            <Badge tone="danger">风险</Badge>
          </div>
          <Card className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <Metric label="职业分类" value="8" />
            <Metric label="决策工具" value="3" />
            <Metric label="学术去向" value="38%" hint="2025" />
            <Metric label="匹配度" value="86" hint="科技企业" />
          </Card>
        </section>

        <section>
          <PageHeader as="h2" kicker="Flow" title="步骤 / Tab / 面包屑" />
          <Card className="space-y-6">
            <Stepper
              current={1}
              steps={[
                { id: "a", label: "背景" },
                { id: "b", label: "资本" },
                { id: "c", label: "结果" },
              ]}
            />
            <Tabs
              value={tab}
              onChange={setTab}
              items={[
                { id: "dest", label: "去向" },
                { id: "pay", label: "薪资" },
                { id: "talk", label: "访谈" },
              ]}
            />
            <p className="text-[13.5px] text-ink-2">
              {tab === "dest" ? "学术去向持续下降，产业与体制内上升。" : tab === "pay" ? "产业岗位中位薪资高于学术岗。" : "访谈用于补充数字背后的决策叙事。"}
            </p>
            <Breadcrumb items={[{ label: "首页", to: "/" }, { label: "职业地图", to: "/careers" }, { label: "科技企业" }]} />
          </Card>
        </section>

        <section>
          <PageHeader as="h2" kicker="Admin" title="密度表格" />
          <DataTable
            rowKey={(r) => r.id}
            rows={tableRows}
            columns={[
              { key: "name", header: "分类" },
              { key: "jobs", header: "岗位数" },
              { key: "tone", header: "趋势", render: (r) => <Badge tone={r.tone === "增长" ? "accent" : "neutral"}>{r.tone}</Badge> },
            ]}
          />
        </section>

        <section>
          <PageHeader as="h2" kicker="Empty" title="空态与浮层" />
          <Card padding="sm">
            <EmptyState
              title="暂无岗位"
              description="调整筛选条件，或稍后再来。内容结构保留，仅展示升级。"
              action={<Button size="sm" variant="secondary">清除筛选</Button>}
            />
          </Card>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>打开对话框</Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>打开侧栏</Button>
          </div>
        </section>
      </PageShell>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="确认保存"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>取消</Button>
            <Button size="sm" onClick={() => setModalOpen(false)}>保存</Button>
          </>
        }
      >
        这是后台表单将使用的对话框骨架。字段与接口仍由各页自己接。
      </Modal>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="编辑分类"
        footer={<Button size="sm" onClick={() => setDrawerOpen(false)}>完成</Button>}
      >
        侧栏用于后台 CRUD，避免每页自建一套弹层。
      </Drawer>
    </div>
  );
}

function cnSwatch(swatch: string) {
  return `h-16 ${swatch}`;
}
