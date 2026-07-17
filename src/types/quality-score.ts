export type QualityDimension = "personalization" | "subjectLine" | "cta" | "painPoint" | "followUpQuality";

export type RecommendationSeverity = "high" | "medium" | "low";

export interface QualityDimensionScore {
  dimension: QualityDimension;
  label: string;
  score: number;
}

export interface QualityRecommendation {
  dimension: QualityDimension;
  severity: RecommendationSeverity;
  message: string;
}

export interface QualityScoreReport {
  overall: number;
  dimensions: QualityDimensionScore[];
  recommendations: QualityRecommendation[];
}

export interface DimensionAnalysis {
  score: QualityDimensionScore;
  recommendations: QualityRecommendation[];
}
