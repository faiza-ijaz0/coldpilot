import type { QualityDimension } from "@/types";

/** Each dimension's share of the overall score. Must sum to 1. */
export const DIMENSION_WEIGHTS: Record<QualityDimension, number> = {
  personalization: 0.2,
  painPointSpecificity: 0.15,
  subjectLine: 0.15,
  cta: 0.15,
  messageClarity: 0.1,
  conciseness: 0.05,
  sequenceProgression: 0.1,
  spamLanguage: 0.1,
};
