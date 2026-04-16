export const PLAN_LIMITS = {
  FREE: {
    maxUsers: 2,
    maxExpensesPerMonth: 50,
    features: ["basic_reports"],
  },
  FULL: {
    maxUsers: Infinity,
    maxExpensesPerMonth: Infinity,
    features: ["basic_reports", "pdf_export", "excel_export", "email_notifications", "custom_branding"],
  },
} as const;

export type PlanKey = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string | null) {
  return PLAN_LIMITS[(plan as PlanKey) || "FREE"] || PLAN_LIMITS.FREE;
}

export function hasFeature(plan: string | null, feature: string) {
  const limits = getPlanLimits(plan);
  return (limits.features as readonly string[]).includes(feature);
}
