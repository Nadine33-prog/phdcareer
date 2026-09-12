import { DEMO_DESTINATIONS, DEMO_INTERVIEWS, DEMO_SALARIES, type DemoSalary } from "@/data/demoInsights";
import type { Destination, InterviewRecord, SalaryRecord } from "@/types/insights";

export type SalaryRow = SalaryRecord & { categoryId?: number | null };

/** 与 src/data/demoInsights.ts、seed 同源。 */
export const PREVIEW_DESTINATIONS: Destination[] = DEMO_DESTINATIONS;
export const PREVIEW_SALARIES: DemoSalary[] = DEMO_SALARIES;
export const PREVIEW_INTERVIEWS: InterviewRecord[] = DEMO_INTERVIEWS;
