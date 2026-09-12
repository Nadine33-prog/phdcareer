// ═══ 职业分类路由 ═══
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export default async function careerRoutes(app: FastifyInstance) {
  app.get("/categories", async (_req, reply) => {
    const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
    return reply.send({ data: categories });
  });
  app.get("/categories/:id", async (req, reply) => {
    const id = parseInt((req.params as { id: string }).id);
    if (isNaN(id) || id < 1) return reply.status(404).send({ error: "NOT_FOUND", message: "该分类不存在" });
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) return reply.status(404).send({ error: "NOT_FOUND", message: "该分类不存在" });
    return reply.send({ data: cat });
  });
}
