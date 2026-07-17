import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { getEmailPlainText } from "@/lib/html-utils";
import { clamp, containsAny, tokenize, wordOverlapRatio } from "@/lib/quality-score/text-utils";

const IMPACT_KEYWORDS = [
  "cost",
  "costly",
  "wasted",
  "waste",
  "losing",
  "lose",
  "slipping",
  "slip",
  "missed",
  "miss",
  "drop",
  "dropping",
  "bottleneck",
  "risk",
  "expensive",
  "falling through",
  "quietly",
];

export function analyzePainPoint(result: GeneratorResult): DimensionAnalysis {
  const { input, emails } = result;
  const introEmail = emails.find((email) => email.slot === "introduction");
  const introBody = introEmail ? getEmailPlainText(introEmail) : "";
  const allBodies = emails.map((email) => getEmailPlainText(email)).join(" ");

  const painPointWordCount = tokenize(input.painPoint).length;
  const specificityScore = clamp(Math.min(100, painPointWordCount * 12));

  const introOverlap = wordOverlapRatio(input.painPoint, introBody);
  const reinforcedInFollowUps = emails
    .filter((email) => email.slot !== "introduction")
    .some((email) => wordOverlapRatio(input.painPoint, getEmailPlainText(email)) > 0.3);

  const hasImpactLanguage = containsAny(allBodies, IMPACT_KEYWORDS);

  const score = clamp(
    Math.round(
      specificityScore * 0.4 + introOverlap * 100 * 0.35 + (hasImpactLanguage ? 15 : 0) + (reinforcedInFollowUps ? 10 : 0)
    )
  );

  const recommendations: DimensionAnalysis["recommendations"] = [];
  if (painPointWordCount < 4) {
    recommendations.push({
      dimension: "painPoint",
      severity: "high",
      message: "Pain point is too vague — describe the specific, day-to-day symptom instead of a one-word category.",
    });
  }
  if (introOverlap < 0.4) {
    recommendations.push({
      dimension: "painPoint",
      severity: "medium",
      message: "The pain point you entered barely shows up in the copy — make sure the introduction names it directly.",
    });
  }
  if (!hasImpactLanguage) {
    recommendations.push({
      dimension: "painPoint",
      severity: "low",
      message: "Add a concrete cost or consequence of the pain point (time lost, deals missed, revenue at risk).",
    });
  }
  if (!reinforcedInFollowUps) {
    recommendations.push({
      dimension: "painPoint",
      severity: "low",
      message: "Reinforce the pain point in your follow-ups, not just the introduction.",
    });
  }

  return { score: { dimension: "painPoint", label: "Pain Point", score }, recommendations };
}
