import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { getEmailPlainText } from "@/lib/html-utils";
import { clamp, containsAny, jaccardSimilarity } from "@/lib/quality-score/text-utils";

const SOFT_CLOSE_PHRASES = [
  "last note",
  "close the loop",
  "no worries",
  "no hard feelings",
  "won't keep",
  "i'll leave",
  "appreciate the time",
  "no pressure",
];

export function analyzeFollowUpQuality(result: GeneratorResult): DimensionAnalysis {
  const { emails } = result;
  const introduction = emails.find((email) => email.slot === "introduction");
  const followUp = emails.find((email) => email.slot === "follow-up");
  const finalFollowUp = emails.find((email) => email.slot === "final-follow-up");

  if (!introduction || !followUp || !finalFollowUp) {
    return {
      score: { dimension: "followUpQuality", label: "Follow-Up Quality", score: 20 },
      recommendations: [
        {
          dimension: "followUpQuality",
          severity: "high",
          message: "Sequence is missing follow-up emails — a single touch relies entirely on perfect timing.",
        },
      ],
    };
  }

  const recommendations: DimensionAnalysis["recommendations"] = [];
  let score = 100;

  const introText = getEmailPlainText(introduction);
  const similarityToFollowUp = jaccardSimilarity(introText, getEmailPlainText(followUp));
  const similarityToFinal = jaccardSimilarity(introText, getEmailPlainText(finalFollowUp));

  if (similarityToFollowUp > 0.55) {
    score -= 30;
    recommendations.push({
      dimension: "followUpQuality",
      severity: "high",
      message: "The first follow-up repeats the introduction almost verbatim — give it a new angle.",
    });
  }
  if (similarityToFinal > 0.5) {
    score -= 20;
    recommendations.push({
      dimension: "followUpQuality",
      severity: "medium",
      message: "The final follow-up reads too similar to earlier emails — make it a distinct, lower-pressure close.",
    });
  }

  if (!containsAny(getEmailPlainText(finalFollowUp), SOFT_CLOSE_PHRASES)) {
    score -= 15;
    recommendations.push({
      dimension: "followUpQuality",
      severity: "low",
      message: "The final follow-up could use a softer, lower-pressure close (a 'breakup' style line) instead of pushing again.",
    });
  }

  const gapToFollowUp = followUp.delayDays - introduction.delayDays;
  const gapToFinal = finalFollowUp.delayDays - followUp.delayDays;

  if (gapToFollowUp < 2 || gapToFollowUp > 6) {
    score -= 10;
    recommendations.push({
      dimension: "followUpQuality",
      severity: "low",
      message: `The gap before your first follow-up (${gapToFollowUp} days) is outside the typical 2–5 day sweet spot.`,
    });
  }
  if (gapToFinal < 2 || gapToFinal > 10) {
    score -= 10;
    recommendations.push({
      dimension: "followUpQuality",
      severity: "low",
      message: `The gap before your final follow-up (${gapToFinal} days) could be tightened or extended for better timing.`,
    });
  }

  return { score: { dimension: "followUpQuality", label: "Follow-Up Quality", score: clamp(score) }, recommendations };
}
