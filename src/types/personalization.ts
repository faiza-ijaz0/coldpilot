import type { CTAType } from "./generator";

export type NicheId =
  | "saas"
  | "agencies"
  | "car-dealerships"
  | "real-estate"
  | "healthcare"
  | "ecommerce"
  | "education"
  | "barbershop";

/** Industry-specific vocabulary — the terms that make copy read as written by an insider. */
export interface NicheVocabulary {
  audience: string;
  workUnit: string;
  metric: string;
}

/**
 * One configuration file per niche implements this shape. Adding a new
 * niche is: write one config file + register it in `niches/index.ts` —
 * nothing else in the personalization or generator engines changes.
 */
export interface NicheConfig {
  id: NicheId;
  label: string;
  vocabulary: NicheVocabulary;
  introductions: string[];
  painPoints: string[];
  ctas: Record<CTAType, string[]>;
}
