// ═══ JWT 认证插件 ═══
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { verifyToken } from "../lib/jwt.js";

declare module "fastify" {
  interface FastifyRequest { user?: { userId: number; username: string; role: string }; }
}

async function authPlugin(app: FastifyInstance) {
  app.decorateRequest("user", undefined);
  app.addHook("onRequest", async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.url.startsWith("/api/admin")) return;
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) { reply.status(401).send({ error: "UNAUTHORIZED", message: "缺少认证令牌" }); return; }
    const payload = verifyToken(auth.slice(7));
    if (!payload) { reply.status(401).send({ error: "UNAUTHORIZED", message: "令牌无效或已过期" }); return; }
    if (payload.role !== "admin") { reply.status(403).send({ error: "FORBIDDEN", message: "需要管理员权限" }); return; }
    req.user = payload;
  });
}

export default fp(authPlugin, { name: "auth" });
