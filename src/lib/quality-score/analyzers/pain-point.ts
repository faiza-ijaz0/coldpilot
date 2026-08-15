import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { clamp } from "@/lib/quality-score/text-utils";

const QUALIFIER_PHRASE =
  /\b(from|in|during|on|for|at|with|due to|because|caused by|among|across|within|per|when|after|before)\b/i;
const MEASUREMENT_WORD =
  /\b(rate|rates|ratio|percent|percentage|conversion|conversions|retention|churn|response ?time|turnaround|no-?shows?|abandonment|drop-?off|lead ?time|cycle ?time|volume|throughput|revenue|margin|utilization|occupancy|bookings?|show ?rate)\b/i;

interface SpecificityBreakdown {
  score: number;
  hasQualifier: boolean;
  hasMeasurement: boolean;
}

/**
 * Contextual specificity, not a naive word-count threshold: length gives a
 * capped base ("marketing" tops out low no matter what), a qualifying
 * clause ("...from mobile traffic") adds real specificity, and reaching
 * the top tier requires a concrete, measurable anchor (a metric or a
 * number) — not just more words.
 */
function specificityBreakdown(painPoint: string): SpecificityBreakdown {
  const trimmed = painPoint.trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const hasNumber = /\d/.test(trimmed);
  const hasQualifier = QUALIFIER_PHRASE.test(trimmed);
  const hasMeasurement = MEASUREMENT_WORD.test(trimmed);

  let score = clamp(wordCount * 9, 0, 45);
  if (hasQualifier) score += 15;
  if (hasMeasurement) score += 20;
  if (hasNumber) score += 15;
  if (!hasMeasurement && !hasNumber) score = Math.min(score, 65);

  return { score: clamp(score), hasQualifier, hasMeasurement };
}

export function analyzePainPoint(result: GeneratorResult): DimensionAnalysis {
  const painPoint = result.input.painPoint;

  if (!painPoint.trim()) {
    return {
      score: { dimension: "painPointSpecificity", label: "Pain Point Specificity", score: 0 },
      recommendations: [
        {
          dimension: "painPointSpecificity",
          severity: "critical",
          message: "No pain point was provided — the sequence has nothing concrete to hook the reader with.",
        },
      ],
      strengths: [],
    };
  }

  const { score } = specificityBreakdown(painPoint);
  const recommendations: DimensionAnalysis["recommendations"] = [];
  const strengths: DimensionAnalysis["strengths"] = [];

  if (score < 40) {
    recommendations.push({
      dimension: "painPointSpecificity",
      severity: "warning",
      message: `"${painPoint}" is fairly vague — describe the specific symptom (what's failing, where, or for whom) instead of a general category.`,
    });
  } else if (score < 70) {
    recommendations.push({
      dimension: "painPointSpecificity",
      severity: "info",
      message: `"${painPoint}" is moderately specific — adding a metric, channel, or segment (e.g. "...from mobile traffic") would sharpen it further.`,
    });
  } else {
    strengths.push({
      dimension: "painPointSpecificity",
      message: `"${painPoint}" is a specific, concrete pain point — it gives the copy something real to reference.`,
    });
  }

  return { score: { dimension: "painPointSpecificity", label: "Pain Point Specificity", score }, recommendations, strengths };
}
