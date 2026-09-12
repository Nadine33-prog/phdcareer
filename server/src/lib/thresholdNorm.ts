// ═══ 门槛评估答卷落库 + 常模统计 ═══
import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma.js";
import { NORM_DEDUPE_DAYS, NORM_READY_TOTAL } from "../../../src/utils/scoring.js";
import type { ThresholdForm, ThresholdResult } from "../../../src/types/threshold.js";

const CLIENT_KEY_RE = /^[A-Za-z0-9_-]{8,64}$/;

export function sanitizeClientKey(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim();
  return CLIENT_KEY_RE.test(key) ? key : null;
}

function sanitizeAnswers(form: ThresholdForm): ThresholdForm {
  return { ...form, targetFacultyList: "" };
}

function quantile(sorted: number[], q: number): number | null {
  if (!sorted.length) return null;
  const i = (sorted.length - 1) * q;
  const lo = Math.floor(i);
  const hi = Math.ceil(i);
  if (lo === hi) return sorted[lo];
  return Math.round(sorted[lo] * (hi - i) + sorted[hi] * (i - lo));
}

export async function persistThresholdSubmission(opts: {
  form: ThresholdForm;
  result: ThresholdResult;
  clientKey?: string | null;
  userId?: number | null;
  includeInNorm: boolean;
}): Promise<{ sampleN: number }> {
  const { form, result, includeInNorm } = opts;
  const clientKey = sanitizeClientKey(opts.clientKey);
  const userId = opts.userId && Number.isFinite(opts.userId) ? opts.userId : null;
  const now = new Date();
  const since = new Date(now.getTime() - NORM_DEDUPE_DAYS * 24 * 60 * 60 * 1000);

  if (includeInNorm) {
    const where: Prisma.ThresholdSubmissionWhereInput = {
      includeInNorm: true,
      createdAt: { gte: since },
      OR: [
        ...(userId ? [{ userId }] : []),
        ...(clientKey ? [{ clientKey }] : []),
      ],
    };
    if (where.OR && where.OR.length > 0) {
      await prisma.thresholdSubmission.updateMany({
        where,
        data: { includeInNorm: false },
      });
    }
  }

  const s = result.breakdown;
  await prisma.thresholdSubmission.create({
    data: {
      userId,
      clientKey,
      answers: sanitizeAnswers(form) as unknown as Prisma.InputJsonValue,
      result: result as unknown as Prisma.InputJsonValue,
      eduScore: s.eduScore,
      paperScore: s.paperScore,
      grantScore: s.grantScore,
      overseasScore: s.overseasScore,
      ageScore: s.ageScore,
      impactScore: s.impactScore,
      awardScore: s.awardScore,
      userScore: s.userScore,
      percentile: s.percentile,
      percentileMode: result.norm?.percentileSource ?? "illustrative",
      disciplineMajor: form.disciplineMajor,
      phdYear: form.phdYear,
      age: parseInt(form.age, 10) || null,
      hasTarget: form.hasTarget === "yes",
      targetTier: form.hasTarget === "yes" ? form.targetTier : null,
      includeInNorm,
    },
  });

  const sampleN = await prisma.thresholdSubmission.count({ where: { includeInNorm: true } });
  return { sampleN };
}

export async function countNormSample(): Promise<number> {
  return prisma.thresholdSubmission.count({ where: { includeInNorm: true } });
}

export async function getThresholdNormStats() {
  const [total, rows] = await Promise.all([
    prisma.thresholdSubmission.count(),
    prisma.thresholdSubmission.findMany({
      where: { includeInNorm: true },
      select: { userScore: true, disciplineMajor: true, phdYear: true },
    }),
  ]);
  const scores = rows.map((r) => r.userScore).sort((a, b) => a - b);
  const inNorm = scores.length;

  const byDisciplineMap = new Map<string, number[]>();
  const byYearMap = new Map<string, number>();
  for (const r of rows) {
    const list = byDisciplineMap.get(r.disciplineMajor) ?? [];
    list.push(r.userScore);
    byDisciplineMap.set(r.disciplineMajor, list);
    byYearMap.set(r.phdYear, (byYearMap.get(r.phdYear) ?? 0) + 1);
  }

  const buckets = [0, 20, 40, 60, 80].map((from) => {
    const to = from + 19;
    return {
      from,
      to: from === 80 ? 100 : to,
      n: scores.filter((s) => (from === 80 ? s >= from : s >= from && s <= to)).length,
    };
  });

  return {
    total,
    inNorm,
    readyAt: NORM_READY_TOTAL,
    remaining: Math.max(0, NORM_READY_TOTAL - inNorm),
    readyForEmpirical: inNorm >= NORM_READY_TOTAL,
    median: quantile(scores, 0.5),
    p25: quantile(scores, 0.25),
    p75: quantile(scores, 0.75),
    byDiscipline: [...byDisciplineMap.entries()]
      .map(([name, list]) => {
        const sorted = [...list].sort((a, b) => a - b);
        return { name, n: list.length, median: quantile(sorted, 0.5) };
      })
      .sort((a, b) => b.n - a.n),
    byYear: [...byYearMap.entries()]
      .map(([year, n]) => ({ year, n }))
      .sort((a, b) => b.year.localeCompare(a.year)),
    buckets,
  };
}
