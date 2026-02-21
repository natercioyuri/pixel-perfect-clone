export const PLANS = {
  starter: {
    name: "Starter",
    price_id: "price_1T0v2MBCu2U1iU6z0NtLE82I",
    product_id: "prod_TysnxyPY7dXqVK",
    price: 29.9,
    limits: {
      searchesPerDay: 20,
      transcriptions: false,
      aiScripts: false,
      alerts: false,
    },
  },
  pro: {
    name: "Pro",
    price_id: "price_1T0vszBCu2U1iU6zHk08VZj5",
    product_id: "prod_TytgUGD2tNKYbs",
    price: 60,
    limits: {
      searchesPerDay: Infinity,
      transcriptions: true,
      aiScripts: true,
      alerts: true,
    },
  },
  business: {
    name: "Business",
    price_id: "price_1T0vtGBCu2U1iU6ziNHoxmgk",
    product_id: "prod_TytgzeWLP67bjX",
    price: 120,
    limits: {
      searchesPerDay: Infinity,
      transcriptions: true,
      aiScripts: true,
      alerts: true,
    },
  },
  master: {
    name: "Master",
    price_id: "",
    product_id: "",
    price: 0,
    limits: {
      searchesPerDay: Infinity,
      transcriptions: true,
      aiScripts: true,
      alerts: true,
    },
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanLimits(plan: string) {
  return PLANS[plan as PlanKey]?.limits || PLANS.starter.limits;
}

export function canAccessFeature(plan: string, feature: keyof typeof PLANS.starter.limits): boolean {
  if (plan === "master") return true;
  const limits = getPlanLimits(plan);
  return !!limits[feature];
}
