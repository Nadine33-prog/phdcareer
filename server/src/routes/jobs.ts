// ═══ 岗位路由 ═══
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export default async function jobRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const { type, region, categoryId, q, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { active: true };
    if (type && type !== "全部") where.type = type;
    if (region && region !== "全部") where.region = region;
    if (categoryId) where.categoryId = parseInt(categoryId);
    const p = Math.max(1, parseInt(page)), l = Math.min(100, Math.max(1, parseInt(limit)));
    let jobs;
    if (q?.trim()) {
      jobs = await prisma.job.findMany({ where: { ...where, OR: [{ title: { contains: q } }, { org: { contains: q } }] } as never, orderBy: { id: "desc" }, skip: (p - 1) * l, take: l });
    } else {
      jobs = await prisma.job.findMany({ where: where as never, orderBy: { id: "desc" }, skip: (p - 1) * l, take: l });
    }
    const total = await prisma.job.count({ where: where as never });
    return reply.send({ data: jobs, total, page: p });
  });
  app.get("/:id", async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id);
    const job = await prisma.job.findFirst({ where: { id, active: true } });
    if (!job) return reply.status(404).send({ error: "NOT_FOUND", message: "该岗位不存在" });
    return reply.send({ data: job });
  });
}
