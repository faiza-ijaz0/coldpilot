import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { getEmailPlainText } from "@/lib/html-utils";
import { averageSentenceLength, clamp, containsAny, wordCount } from "@/lib/quality-score/text-utils";

const GENERIC_OPENERS = [
  "i hope this email finds you well",
  "to whom it may concern",
  "dear sir or madam",
  "dear sir/madam",
  "i am writing to",
];

/** Leftover stripped-placeholder residue (e.g. "Hi ,") or a raw merge-field brace that slipped through. */
const ARTIFACT_PATTERN = /\s,|,,|\{\{|\}\}/;

function scoreEmailClarity(body: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  const words = wordCount(body);
  if (words < 15) {
    score -= 35;
    issues.push("thin");
  }

  const avgSentence = averageSentenceLength(body);
  if (avgSentence > 30) {
    score -= 20;
    issues.push("run-on");
  } else if (avgSentence > 0 && avgSentence < 4 && words > 20) {
    score -= 10;
    issues.push("choppy");
  }

  if (containsAny(body, GENERIC_OPENERS)) {
    score -= 20;
    issues.push("generic-opener");
  }

  if (ARTIFACT_PATTERN.test(body)) {
    score -= 15;
    issues.push("artifact");
  }

  return { score: clamp(score), issues };
}

export function analyzeMessageClarity(result: GeneratorResult): DimensionAnalysis {
  const perEmail = result.emails.map((email) => ({ email, ...scoreEmailClarity(getEmailPlainText(email)) }));
  const score = clamp(Math.round(perEmail.reduce((sum, entry) => sum + entry.score, 0) / perEmail.length));

  const recommendations: DimensionAnalysis["recommendations"] = [];
  const strengths: DimensionAnalysis["strengths"] = [];

  if (perEmail.some((entry) => entry.issues.includes("thin"))) {
    recommendations.push({
      dimension: "messageClarity",
      severity: "warning",
      message: "One or more emails is too thin to make a real case — flesh it out with a bit more context.",
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("run-on"))) {
    recommendations.push({
      dimension: "messageClarity",
      severity: "warning",
      message: "Some sentences run long — break them up so the email is easier to scan.",
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("generic-opener"))) {
    recommendations.push({
      dimension: "messageClarity",
      severity: "warning",
      message: 'Drop generic openers like "I hope this email finds you well" — they read as mass mail.',
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("artifact"))) {
    recommendations.push({
      dimension: "messageClarity",
      severity: "info",
      message: "There's leftover formatting or a stray placeholder token affecting readability — give the copy a once-over.",
    });
  }
  if (score >= 90) {
    strengths.push({ dimension: "messageClarity", message: "Copy reads clearly with well-paced sentences." });
  }

  return { score: { dimension: "messageClarity", label: "Message Clarity", score }, recommendations, strengths };
}
