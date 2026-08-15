import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { getEmailPlainText } from "@/lib/html-utils";
import { clamp, jaccardSimilarity, wordOverlapRatio } from "@/lib/quality-score/text-utils";

/**
 * Evaluates the arc across the 3 emails structurally — distinctiveness
 * between touches, whether the intro actually establishes the problem, and
 * whether the final touch reads like a lower-pressure close — rather than
 * matching against a fixed "breakup email" phrase bank (which would just
 * reward the generator's own wording for saying the same thing).
 */
export function analyzeSequenceProgression(result: GeneratorResult): DimensionAnalysis {
  const { input, emails } = result;
  const introduction = emails.find((email) => email.slot === "introduction");
  const followUp = emails.find((email) => email.slot === "follow-up");
  const finalFollowUp = emails.find((email) => email.slot === "final-follow-up");

  if (!introduction || !followUp || !finalFollowUp) {
    return {
      score: { dimension: "sequenceProgression", label: "Sequence Progression", score: 15 },
      recommendations: [
        {
          dimension: "sequenceProgression",
          severity: "critical",
          message: "Sequence is missing one or more emails — a single touch relies entirely on perfect timing.",
        },
      ],
      strengths: [],
    };
  }

  const recommendations: DimensionAnalysis["recommendations"] = [];
  const strengths: DimensionAnalysis["strengths"] = [];
  let score = 100;

  const introText = getEmailPlainText(introduction);
  const followUpText = getEmailPlainText(followUp);
  const finalText = getEmailPlainText(finalFollowUp);

  const simIntroFollow = jaccardSimilarity(introText, followUpText);
  const simIntroFinal = jaccardSimilarity(introText, finalText);
  const simFollowFinal = jaccardSimilarity(followUpText, finalText);
  const maxSimilarity = Math.max(simIntroFollow, simIntroFinal, simFollowFinal);

  if (maxSimilarity > 0.85) {
    score -= 50;
    recommendations.push({
      dimension: "sequenceProgression",
      severity: "critical",
      message: "Two emails in the sequence are nearly identical — each touch should read differently.",
    });
  } else if (maxSimilarity > 0.6) {
    score -= 35;
    recommendations.push({
      dimension: "sequenceProgression",
      severity: "critical",
      message: "Two emails in the sequence are nearly identical — each touch should read differently.",
    });
  } else if (maxSimilarity > 0.4) {
    score -= 15;
    recommendations.push({
      dimension: "sequenceProgression",
      severity: "warning",
      message: "A couple of emails overlap heavily in wording — give each one a distinct angle.",
    });
  } else {
    strengths.push({ dimension: "sequenceProgression", message: "Each email reads distinctly — no repetitive follow-ups." });
  }

  const introEstablishesProblem = wordOverlapRatio(input.painPoint, introText) > 0.3;
  if (!introEstablishesProblem) {
    score -= 15;
    recommendations.push({
      dimension: "sequenceProgression",
      severity: "warning",
      message: "The introduction doesn't clearly establish the problem — lead with the pain point up front.",
    });
  }

  const introWords = introText.trim().split(/\s+/).filter(Boolean).length;
  const finalWords = finalText.trim().split(/\s+/).filter(Boolean).length;
  if (introWords > 0 && finalWords > introWords * 1.2) {
    score -= 10;
    recommendations.push({
      dimension: "sequenceProgression",
      severity: "info",
      message: "The final follow-up is longer than the introduction — a last touch usually reads better shorter and lower-pressure.",
    });
  }

  const gapToFollowUp = followUp.delayDays - introduction.delayDays;
  const gapToFinal = finalFollowUp.delayDays - followUp.delayDays;
  if (gapToFollowUp < 2 || gapToFollowUp > 6) {
    score -= 10;
    recommendations.push({
      dimension: "sequenceProgression",
      severity: "info",
      message: `The gap before your first follow-up (${gapToFollowUp} day${gapToFollowUp === 1 ? "" : "s"}) is outside the typical 2–5 day window.`,
    });
  }
  if (gapToFinal < 2 || gapToFinal > 10) {
    score -= 10;
    recommendations.push({
      dimension: "sequenceProgression",
      severity: "info",
      message: `The gap before your final follow-up (${gapToFinal} days) could be tightened or extended for better timing.`,
    });
  }

  return {
    score: { dimension: "sequenceProgression", label: "Sequence Progression", score: clamp(score) },
    recommendations,
    strengths,
  };
}
