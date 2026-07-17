import type { GeneratorResult, QualityScoreReport } from "@/types";
import { analyzePersonalization } from "@/lib/quality-score/analyzers/personalization";
import { analyzeSubjectLines } from "@/lib/quality-score/analyzers/subject-line";
import { analyzeCta } from "@/lib/quality-score/analyzers/cta";
import { analyzePainPoint } from "@/lib/quality-score/analyzers/pain-point";
import { analyzeFollowUpQuality } from "@/lib/quality-score/analyzers/follow-up";

/**
 * Scores a generated sequence with rule-based heuristics only — no external
 * API calls. Adding a new dimension is: write an analyzer that returns a
 * `DimensionAnalysis`, then add it to this list.
 */
export function scoreSequence(result: GeneratorResult): QualityScoreReport {
  const analyses = [
    analyzePersonalization(result),
    analyzeSubjectLines(result),
    analyzeCta(result),
    analyzePainPoint(result),
    analyzeFollowUpQuality(result),
  ];

  const dimensions = analyses.map((analysis) => analysis.score);
  const recommendations = analyses.flatMap((analysis) => analysis.recommendations);
  const overall = Math.round(dimensions.reduce((sum, dimension) => sum + dimension.score, 0) / dimensions.length);

  return { overall, dimensions, recommendations };
}
