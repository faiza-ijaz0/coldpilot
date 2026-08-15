import type { DimensionAnalysis, EmailLength, GeneratorResult } from "@/types";
import { getEmailPlainText } from "@/lib/html-utils";
import { clamp, wordCount } from "@/lib/quality-score/text-utils";

/** Target word-count bands per the length the user asked for — a deliberately "long" email isn't penalized like a bloated "short" one. */
const TARGET_RANGES: Record<EmailLength, { min: number; max: number }> = {
  short: { min: 30, max: 90 },
  medium: { min: 60, max: 150 },
  long: { min: 110, max: 230 },
};

function scoreLength(words: number, range: { min: number; max: number }): { score: number; issue: "short" | "long" | null } {
  if (words < range.min) {
    const deficit = (range.min - words) / range.min;
    return { score: clamp(100 - deficit * 100), issue: "short" };
  }
  if (words > range.max) {
    const excess = (words - range.max) / range.max;
    return { score: clamp(100 - excess * 90), issue: "long" };
  }
  return { score: 100, issue: null };
}

export function analyzeConciseness(result: GeneratorResult): DimensionAnalysis {
  const range = TARGET_RANGES[result.input.emailLength];
  const perEmail = result.emails.map((email) => {
    const words = wordCount(getEmailPlainText(email));
    return { email, words, ...scoreLength(words, range) };
  });

  const score = clamp(Math.round(perEmail.reduce((sum, entry) => sum + entry.score, 0) / perEmail.length));

  const recommendations: DimensionAnalysis["recommendations"] = [];
  const strengths: DimensionAnalysis["strengths"] = [];

  const tooLong = perEmail.filter((entry) => entry.issue === "long");
  const tooShort = perEmail.filter((entry) => entry.issue === "short");

  if (tooLong.length > 0) {
    recommendations.push({
      dimension: "conciseness",
      severity: tooLong.some((entry) => entry.score < 60) ? "warning" : "info",
      message: `${tooLong.map((entry) => entry.email.label).join(", ")} ${tooLong.length > 1 ? "run" : "runs"} long for cold outreach — shorter emails generally convert better.`,
    });
  }
  if (tooShort.length > 0) {
    recommendations.push({
      dimension: "conciseness",
      severity: tooShort.some((entry) => entry.score < 60) ? "warning" : "info",
      message: `${tooShort.map((entry) => entry.email.label).join(", ")} ${tooShort.length > 1 ? "feel" : "feels"} thin — make sure there's enough context to earn a reply.`,
    });
  }
  if (score >= 90) {
    strengths.push({ dimension: "conciseness", message: "Each email is an appropriately tight length for cold outreach." });
  }

  return { score: { dimension: "conciseness", label: "Conciseness", score }, recommendations, strengths };
}
