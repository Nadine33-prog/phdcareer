// ═══ 环境配置 ═══
import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "3000"),
  jwtSecret: process.env.JWT_SECRET || "beyond-academia-dev-secret",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
};
