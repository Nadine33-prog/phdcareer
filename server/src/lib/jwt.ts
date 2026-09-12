// ═══ JWT 工具 ═══
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export function signToken(payload: { userId: number; username: string; role: string }): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: "24h" });
}

export function verifyToken(token: string): { userId: number; username: string; role: string } | null {
  try { return jwt.verify(token, config.jwtSecret) as { userId: number; username: string; role: string }; } catch { return null; }
}
