// ═══ 决策工具路由（门槛评估 + 职位预警 + 职业评估） ═══
import type { FastifyInstance } from "fastify";
import { evaluate, NORM_READY_TOTAL } from "../../../src/utils/scoring.js";
import { scanJD } from "../../../src/utils/jdAnalyzer.js";
import { evaluateAssessment } from "../../../src/utils/matching.js";
import type { ThresholdForm } from "../../../src/types/threshold.js";
import { verifyToken } from "../lib/jwt.js";
import { countNormSample, persistThresholdSubmission, sanitizeClientKey } from "../lib/thresholdNorm.js";

type ThresholdBody = ThresholdForm & { clientKey?: string };

function optionalUser(req: { headers: { authorization?: string } }) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyToken(auth.slice(7));
}

export default async function toolRoutes(app: FastifyInstance) {
  app.post("/threshold/evaluate", async (req, reply) => {
    try {
      const body = req.body as ThresholdBody;
      if (!body?.disciplineMajor) return reply.status(400).send({ error: "VALIDATION_ERROR", message: "disciplineMajor 为必填字段" });
      const { clientKey: rawKey, ...form } = body;
      const result = evaluate(form);

      const user = optionalUser(req);
      const includeInNorm = user?.role !== "admin";
      let sampleN = 0;
      try {
        const saved = await persistThresholdSubmission({
          form,
          result,
          clientKey: sanitizeClientKey(rawKey),
          userId: user?.userId ?? null,
          includeInNorm,
        });
        sampleN = saved.sampleN;
      } catch (err) {
        app.log.error(err);
        sampleN = await countNormSample().catch(() => 0);
      }

      // 前台百分位仍用示意公式。sampleN ≥ 200 后，在这里改成经验百分位即可。
      return reply.send({
        data: {
          ...result,
          norm: { percentileSource: "illustrative" as const, sampleN, readyAt: NORM_READY_TOTAL },
        },
      });
    } catch (err: unknown) { return reply.status(500).send({ error: "INTERNAL_ERROR", message: `评估计算失败: ${(err as Error).message}` }); }
  });

  app.post("/warning/scan", async (req, reply) => {
    try {
      const { jdText } = req.body as { jdText: string };
      if (!jdText?.trim()) return reply.status(400).send({ error: "VALIDATION_ERROR", message: "jdText 为必填字段" });
      const result = scanJD(jdText);
      return reply.send(result);
    } catch (err: unknown) { return reply.status(500).send({ error: "INTERNAL_ERROR", message: `扫描失败: ${(err as Error).message}` }); }
  });

  app.post("/assessment/evaluate", async (req, reply) => {
    try {
      const { answers } = req.body as { answers: { B: Record<string, number>; C: Record<string, number>; D: string[]; E: Record<string, string | number> } };
      if (!answers) return reply.status(400).send({ error: "VALIDATION_ERROR", message: "answers 为必填字段" });
      const result = evaluateAssessment(answers.B, answers.C, answers.D, answers.E);
      return reply.send(result);
    } catch (err: unknown) { return reply.status(500).send({ error: "INTERNAL_ERROR", message: `评估失败: ${(err as Error).message}` }); }
  });
}
