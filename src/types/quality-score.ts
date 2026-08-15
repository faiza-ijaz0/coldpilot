export type QualityDimension =
  | "personalization"
  | "painPointSpecificity"
  | "subjectLine"
  | "cta"
  | "messageClarity"
  | "conciseness"
  | "sequenceProgression"
  | "spamLanguage";

export type RecommendationSeverity = "info" | "warning" | "critical";

export interface AnalyzerDimensionScore {
  dimension: QualityDimension;
  label: string;
  score: number;
}

export interface QualityDimensionScore extends AnalyzerDimensionScore {
  /** Share (0–1) this dimension contributes to the overall score. */
  weight: number;
}

export interface QualityRecommendation {
  dimension: QualityDimension;
  severity: RecommendationSeverity;
  message: string;
}

/** A concrete factor that's working well — surfaced alongside recommendations so a strong sequence isn't just a wall of nitpicks. */
export interface QualityStrength {
  dimension: QualityDimension;
  message: string;
}

export interface QualityScoreReport {
  overall: number;
  dimensions: QualityDimensionScore[];
  recommendations: QualityRecommendation[];
  strengths: QualityStrength[];
}

export interface DimensionAnalysis {
  score: AnalyzerDimensionScore;
  recommendations: QualityRecommendation[];
  strengths: QualityStrength[];
}
