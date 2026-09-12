// ═══ 学术之外 · 后端入口 ═══
import Fastify from "fastify";
import cors from "@fastify/cors";
import authPlugin from "./plugins/auth.js";
import careerRoutes from "./routes/careers.js";
import jobRoutes from "./routes/jobs.js";
import insightsRoutes from "./routes/insights.js";
import toolRoutes from "./routes/tools.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import { config } from "./config.js";

const app = Fastify({ logger: config.nodeEnv === "development" ? { transport: { target: "pino-pretty" } } : true });

// 注册插件
await app.register(cors, { origin: config.corsOrigin, credentials: true });
await app.register(authPlugin);

// 公开路由
await app.register(careerRoutes, { prefix: "/api/careers" });
await app.register(jobRoutes, { prefix: "/api/jobs" });
await app.register(insightsRoutes, { prefix: "/api/insights" });
await app.register(toolRoutes, { prefix: "/api/tools" });
await app.register(authRoutes, { prefix: "/api/auth" });

// 管理后台路由 (JWT 守卫)
await app.register(adminRoutes, { prefix: "/api/admin" });

// 全局错误处理
app.setErrorHandler((err, _req, reply) => {
  app.log.error(err);
  const status = err.statusCode || 500;
  reply.status(status).send({ error: status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR", message: err.message || "服务器内部错误" });
});

// 健康检查
app.get("/api/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

// 启动
try {
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`🚀 学术之外 API 已启动: http://localhost:${config.port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export default app;
