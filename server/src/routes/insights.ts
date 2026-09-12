// ═══ 职业数据路由 ═══
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export default async function insightsRoutes(app: FastifyInstance) {
  app.get("/destinations", async (req, reply) => {
    const { q, categoryId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (q?.trim()) { const k = q; where.OR = [{ school: { contains: k } }, { major: { contains: k } }, { org: { contains: k } }, { id: { contains: k } }]; }
    if (categoryId) where.categoryId = parseInt(categoryId);
    const data = await prisma.destination.findMany({ where: where as never, orderBy: { id: "desc" } });
    return reply.send({ data, total: data.length });
  });
  app.get("/salaries", async (req, reply) => {
    const { family, year, categoryId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (family && family !== "全部") where.family = family;
    if (year && year !== "全部") where.year = parseInt(year);
    if (categoryId) where.categoryId = parseInt(categoryId);
    const data = await prisma.salary.findMany({ where: where as never, orderBy: { year: "desc" } });
    return reply.send({ data, total: data.length });
  });
  app.get("/interviews", async (req, reply) => {
    const { categoryId } = req.query as Record<string, string>;
    const where: Record<string, unknown> = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    const data = await prisma.interview.findMany({ where: where as never, orderBy: { date: "desc" } });
    return reply.send({ data, total: data.length });
  });
}
