// ═══ 认证路由 ═══
import type { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (req, reply) => {
    const { username, password } = req.body as { username: string; password: string };
    if (!username || !password) return reply.status(400).send({ error: "VALIDATION_ERROR", message: "用户名和密码为必填项" });
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !user.active) return reply.status(401).send({ error: "UNAUTHORIZED", message: "用户名或密码错误" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return reply.status(401).send({ error: "UNAUTHORIZED", message: "用户名或密码错误" });
    const token = signToken({ userId: user.id, username: user.username, role: user.role });
    return reply.send({ data: { token, user: { id: user.id, username: user.username, role: user.role } } });
  });
}
