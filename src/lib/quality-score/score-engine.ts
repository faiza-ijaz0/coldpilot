import type { GeneratorResult, QualityScoreReport } from "@/types";
import { analyzePersonalization } from "@/lib/quality-score/analyzers/personalization";
import { analyzePainPoint } from "@/lib/quality-score/analyzers/pain-point";
import { analyzeSubjectLines } from "@/lib/quality-score/analyzers/subject-line";
import { analyzeCta } from "@/lib/quality-score/analyzers/cta";
import { analyzeMessageClarity } from "@/lib/quality-score/analyzers/message-clarity";
import { analyzeConciseness } from "@/lib/quality-score/analyzers/conciseness";
import { analyzeSequenceProgression } from "@/lib/quality-score/analyzers/sequence-progression";
import { analyzeSpamLanguage } from "@/lib/quality-score/analyzers/spam-language";
import { DIMENSION_WEIGHTS } from "@/lib/quality-score/weights";
import { clamp } from "@/lib/quality-score/text-utils";

/**
 * Scores a generated sequence with rule-based heuristics only — no external
 * API calls. Deterministic: the same sequence always produces the same
 * report. Adding a new dimension is: write an analyzer that returns a
 * `DimensionAnalysis`, add it to this list, and give it a weight below.
 */
export function scoreSequence(result: GeneratorResult): QualityScoreReport {
  const analyses = [
    analyzePersonalization(result),
    analyzePainPoint(result),
    analyzeSubjectLines(result),
    analyzeCta(result),
    analyzeMessageClarity(result),
    analyzeConciseness(result),
    analyzeSequenceProgression(result),
    analyzeSpamLanguage(result),
  ];

  const dimensions = analyses.map((analysis) => ({
    ...analysis.score,
    weight: DIMENSION_WEIGHTS[analysis.score.dimension],
  }));
  const recommendations = analyses.flatMap((analysis) => analysis.recommendations);
  const strengths = analyses.flatMap((analysis) => analysis.strengths);

  const overall = clamp(
    Math.round(dimensions.reduce((sum, dimension) => sum + dimension.score * dimension.weight, 0))
  );

  return { overall, dimensions, recommendations, strengths };
}
