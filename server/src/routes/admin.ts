// ═══ 管理后台路由（完整 CRUD） ═══
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { mediaForCreate, mediaForUpdate, syncMediaLibrary } from "../lib/categoryMedia.js";
import { MEDIA_LIBRARY } from "../../../src/data/category-media.js";
import { getThresholdNormStats } from "../lib/thresholdNorm.js";

function optionalText(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function optionalUrl(value: unknown): string | null {
  const text = optionalText(value);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    return null;
  }
  return null;
}

function optionalInt(value: unknown): number | null {
  if (value === "" || value == null) return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

export default async function adminRoutes(app: FastifyInstance) {
  app.addHook("onRequest", async (req, reply) => { if (!req.user) return reply.status(401).send({ error: "UNAUTHORIZED", message: "需要登录" }); });

  // ═══ 仪表盘 ═══
  app.get("/dashboard", async (_req, reply) => {
    const [cats, jobs, dests, salaries, interviews, users, thresholdTotal, thresholdInNorm] = await Promise.all([
      prisma.category.count(), prisma.job.count({ where: { active: true } }), prisma.destination.count(), prisma.salary.count(), prisma.interview.count(), prisma.user.count(),
      prisma.thresholdSubmission.count(), prisma.thresholdSubmission.count({ where: { includeInNorm: true } }),
    ]);
    return reply.send({ data: { categories: cats, jobs, destinations: dests, salaries, interviews, users, thresholdTotal, thresholdInNorm } });
  });

  // ═══ 职业分类 · 完整 CRUD ═══
  app.get("/categories", async (_req, reply) => {
    const categories = await prisma.category.findMany({ orderBy: { id: "asc" }, include: { _count: { select: { jobs: true } } } });
    const data = categories.map(c => ({ ...c, jobCount: c._count.jobs }));
    return reply.send({ data });
  });

  app.get("/media-library", async (_req, reply) => {
    await syncMediaLibrary();
    const data = await prisma.mediaAsset.findMany({ orderBy: [{ kind: "asc" }, { id: "asc" }] });
    return reply.send({ data: data.length ? data : MEDIA_LIBRARY });
  });

  app.post("/categories", async (req, reply) => {
    const body = req.body as Record<string, unknown>;
    const maxCat = await prisma.category.findFirst({ orderBy: { id: "desc" } });
    const nextId = (maxCat?.id ?? 0) + 1;
    const media = await mediaForCreate(body);
    const cat = await prisma.category.create({
      data: {
        id: nextId,
        name: body.name as string,
        tagline: (body.tagline as string) || "",
        overview: (body.overview as string) || "",
        positions: (body.positions as never) || [],
        employers: (body.employers as never) || [],
        interviews: (body.interviews as never) || [],
        openings: (body.openings as never) || [],
        coverImage: media.coverImage,
        heroImage: media.heroImage,
        imageAlt: media.imageAlt,
        tone: media.tone,
        gallery: media.gallery as never,
      },
      include: { _count: { select: { jobs: true } } },
    });
    return reply.status(201).send({ data: { ...cat, jobCount: cat._count.jobs } });
  });

  app.put("/categories/:id", async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id);
    const body = req.body as Record<string, unknown>;
    const media = mediaForUpdate(body);
    const cat = await prisma.category.update({
      where: { id },
      data: {
        name: body.name as string,
        tagline: (body.tagline as string) || "",
        overview: (body.overview as string) || "",
        positions: (body.positions as never) || [],
        employers: (body.employers as never) || [],
        interviews: (body.interviews as never) || [],
        openings: (body.openings as never) || [],
        ...(media.coverImage != null ? { coverImage: media.coverImage } : {}),
        ...(media.heroImage != null ? { heroImage: media.heroImage } : {}),
        ...(media.imageAlt != null ? { imageAlt: media.imageAlt } : {}),
        ...(media.tone != null ? { tone: media.tone } : {}),
        ...(media.gallery != null ? { gallery: media.gallery as never } : {}),
      },
      include: { _count: { select: { jobs: true } } },
    });
    return reply.send({ data: { ...cat, jobCount: cat._count.jobs } });
  });

  app.delete("/categories/:id", async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id);
    const count = await prisma.job.count({ where: { categoryId: id } });
    if (count > 0) return reply.status(400).send({ error: "HAS_JOBS", message: `该分类下有 ${count} 个岗位，无法删除。请先移除岗位。` });
    await prisma.category.delete({ where: { id } });
    return reply.send({ data: { id } });
  });

  // ═══ 岗位 · 完整 CRUD ═══
  app.get("/jobs", async (req, reply) => { const { page = "1", limit = "20" } = req.query as Record<string, string>; const p = Math.max(1, parseInt(page)), l = Math.min(100, parseInt(limit)); const [data, total] = await Promise.all([prisma.job.findMany({ orderBy: { id: "desc" }, skip: (p - 1) * l, take: l }), prisma.job.count()]); return reply.send({ data, total, page: p }); });

  app.post("/jobs", async (req, reply) => {
    const body = req.body as Record<string, unknown>;
    const job = await prisma.job.create({ data: { title: body.title as string, org: body.org as string, region: body.region as string, type: body.type as string, salary: body.salary as string, posted: (body.posted as string) || "今天", responsibilities: body.responsibilities as never, requirements: body.requirements as never, benefits: body.benefits as never, note: (body.note as string) || "", detailUrl: optionalUrl(body.detailUrl), sourceName: optionalText(body.sourceName), categoryId: body.categoryId ? parseInt(body.categoryId as string) : null } });
    return reply.status(201).send({ data: job });
  });

  app.put("/jobs/:id", async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id);
    const body = req.body as Record<string, unknown>;
    await prisma.job.update({ where: { id }, data: { title: body.title as string, org: body.org as string, region: body.region as string, type: body.type as string, salary: body.salary as string, posted: body.posted as string, responsibilities: body.responsibilities as never, requirements: body.requirements as never, benefits: body.benefits as never, note: (body.note as string) || "", detailUrl: optionalUrl(body.detailUrl), sourceName: optionalText(body.sourceName), categoryId: body.categoryId ? parseInt(body.categoryId as string) : null } });
    return reply.send({ data: { id } });
  });

  app.delete("/jobs/:id", async (req, reply) => { const id = parseInt((req.params as { id: string }).id); await prisma.job.update({ where: { id }, data: { active: false } }); return reply.send({ data: { id } }); });

  // ═══ 职业数据 · 完整 CRUD ═══
  app.post("/insights/destinations", async (req, reply) => {
    const body = req.body as Record<string, unknown>;
    // 自动生成编号: PHD-YYYY-NNN（取最大序号 +1）
    const all = await prisma.destination.findMany({ select: { id: true } });
    let maxNum = 0;
    for (const d of all) { const m = d.id.match(/(\d+)$/); if (m) { const n = parseInt(m[1]); if (n > maxNum) maxNum = n; } }
    const autoId = `PHD-${new Date().getFullYear()}-${String(maxNum + 1).padStart(3, "0")}`;
    const d = await prisma.destination.create({
      data: {
        id: autoId,
        school: String(body.school ?? ""),
        major: String(body.major ?? ""),
        org: String(body.org ?? ""),
        type: String(body.type ?? ""),
        year: String(body.year ?? ""),
        location: String(body.location ?? ""),
        source: optionalText(body.source) ?? "",
        sourceUrl: optionalUrl(body.sourceUrl),
        isSynthetic: body.isSynthetic !== false && body.isSynthetic !== "false",
        categoryId: optionalInt(body.categoryId),
      },
    });
    return reply.status(201).send({ data: d });
  });
  app.put("/insights/destinations/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as Record<string, unknown>;
    await prisma.destination.update({
      where: { id },
      data: {
        school: String(body.school ?? ""),
        major: String(body.major ?? ""),
        org: String(body.org ?? ""),
        type: String(body.type ?? ""),
        year: String(body.year ?? ""),
        location: String(body.location ?? ""),
        source: optionalText(body.source) ?? "",
        sourceUrl: optionalUrl(body.sourceUrl),
        isSynthetic: body.isSynthetic !== false && body.isSynthetic !== "false",
        categoryId: optionalInt(body.categoryId),
      },
    });
    return reply.send({ data: { id } });
  });
  app.delete("/insights/destinations/:id", async (req, reply) => { const { id } = req.params as { id: string }; await prisma.destination.delete({ where: { id } }); return reply.send({ data: { id } }); });

  app.post("/insights/salaries", async (req, reply) => {
    const body = req.body as Record<string, unknown>;
    const d = await prisma.salary.create({
      data: {
        org: String(body.org ?? ""),
        position: String(body.position ?? ""),
        family: String(body.family ?? ""),
        salary: parseInt(String(body.salary), 10) || 0,
        year: parseInt(String(body.year), 10) || new Date().getFullYear(),
        n: parseInt(String(body.n), 10) || 1,
        source: String(body.source ?? ""),
        sourceUrl: optionalUrl(body.sourceUrl),
        categoryId: optionalInt(body.categoryId),
      },
    });
    return reply.status(201).send({ data: d });
  });
  app.put("/insights/salaries/:id", async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id);
    const body = req.body as Record<string, unknown>;
    await prisma.salary.update({
      where: { id },
      data: {
        org: String(body.org ?? ""),
        position: String(body.position ?? ""),
        family: String(body.family ?? ""),
        salary: parseInt(String(body.salary), 10) || 0,
        year: parseInt(String(body.year), 10) || new Date().getFullYear(),
        n: parseInt(String(body.n), 10) || 1,
        source: String(body.source ?? ""),
        sourceUrl: optionalUrl(body.sourceUrl),
        categoryId: optionalInt(body.categoryId),
      },
    });
    return reply.send({ data: { id } });
  });
  app.delete("/insights/salaries/:id", async (req, reply) => { const id = parseInt((req.params as { id: string }).id); await prisma.salary.delete({ where: { id } }); return reply.send({ data: { id } }); });

  app.post("/insights/interviews", async (req, reply) => { const d = await prisma.interview.create({ data: req.body as never }); return reply.status(201).send({ data: d }); });
  app.put("/insights/interviews/:id", async (req, reply) => { const id = parseInt((req.params as { id: string }).id); await prisma.interview.update({ where: { id }, data: req.body as never }); return reply.send({ data: { id } }); });
  app.delete("/insights/interviews/:id", async (req, reply) => { const id = parseInt((req.params as { id: string }).id); await prisma.interview.delete({ where: { id } }); return reply.send({ data: { id } }); });

  // ═══ 权重矩阵 ═══
  app.get("/weights", async (_req, reply) => { const data = await prisma.assessmentWeight.findMany({ orderBy: [{ itemId: "asc" }, { categoryId: "asc" }] }); return reply.send({ data }); });
  app.put("/weights/batch", async (req, reply) => { const { weights } = req.body as { weights: { itemId: string; categoryId: number; weight: number }[] }; for (const w of weights) { await prisma.assessmentWeight.upsert({ where: { itemId_categoryId: { itemId: w.itemId, categoryId: w.categoryId } }, update: { weight: w.weight }, create: w }); } return reply.send({ data: { updated: weights.length } }); });

  app.get("/rules", async (_req, reply) => { const data = await prisma.riskRule.findMany({ orderBy: { id: "asc" } }); return reply.send({ data }); });
  app.post("/rules", async (req, reply) => { const d = await prisma.riskRule.create({ data: req.body as never }); return reply.status(201).send({ data: d }); });
  app.put("/rules/:id", async (req, reply) => { const id = parseInt((req.params as { id: string }).id); await prisma.riskRule.update({ where: { id }, data: req.body as never }); return reply.send({ data: { id } }); });
  app.delete("/rules/:id", async (req, reply) => { const id = parseInt((req.params as { id: string }).id); await prisma.riskRule.delete({ where: { id } }); return reply.send({ data: { id } }); });

  app.get("/benchmarks", async (_req, reply) => { const data = await prisma.benchmark.findMany(); return reply.send({ data }); });
  app.put("/benchmarks/:key", async (req, reply) => { const { key } = req.params as { key: string }; const { data } = req.body as { data: unknown }; await prisma.benchmark.upsert({ where: { key }, update: { data: data as never }, create: { key, data: data as never } }); return reply.send({ data: { key } }); });

  app.get("/users", async (_req, reply) => { const data = await prisma.user.findMany({ select: { id: true, username: true, role: true, active: true, createdAt: true }, orderBy: { id: "asc" } }); return reply.send({ data }); });
  app.put("/users/:id/role", async (req, reply) => { const id = parseInt((req.params as { id: string }).id); const { role } = req.body as { role: string }; await prisma.user.update({ where: { id }, data: { role: role as "user" | "admin" } }); return reply.send({ data: { id } }); });

  // ═══ 门槛常模答卷 ═══
  app.get("/threshold-submissions/stats", async (_req, reply) => {
    return reply.send({ data: await getThresholdNormStats() });
  });

  app.get("/threshold-submissions", async (req, reply) => {
    const { page = "1", limit = "20" } = req.query as Record<string, string>;
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(100, parseInt(limit, 10) || 20);
    const [rows, total] = await Promise.all([
      prisma.thresholdSubmission.findMany({
        orderBy: { id: "desc" },
        skip: (p - 1) * l,
        take: l,
        select: {
          id: true, userScore: true, percentile: true, percentileMode: true,
          disciplineMajor: true, phdYear: true, age: true, hasTarget: true,
          targetTier: true, includeInNorm: true, createdAt: true, userId: true,
        },
      }),
      prisma.thresholdSubmission.count(),
    ]);
    return reply.send({ data: rows, total, page: p });
  });

  app.put("/threshold-submissions/:id/norm", async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id, 10);
    const { includeInNorm } = req.body as { includeInNorm: boolean };
    await prisma.thresholdSubmission.update({ where: { id }, data: { includeInNorm: Boolean(includeInNorm) } });
    return reply.send({ data: { id, includeInNorm: Boolean(includeInNorm) } });
  });
}
