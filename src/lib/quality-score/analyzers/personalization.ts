import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { getEmailPlainText } from "@/lib/html-utils";
import { clamp, containsAny, wordOverlapRatio } from "@/lib/quality-score/text-utils";

const GENERIC_OPENERS = [
  "i hope this email finds you well",
  "to whom it may concern",
  "dear sir or madam",
  "dear sir/madam",
  "i am writing to",
];

export function analyzePersonalization(result: GeneratorResult): DimensionAnalysis {
  const { input, emails } = result;
  const fullText = emails.map((email) => `${email.subject} ${getEmailPlainText(email)}`).join(" ");

  const inputSignals = [input.businessName, input.industry, input.targetAudience, input.painPoint, input.offer].filter(
    Boolean
  );
  const coverage = inputSignals.length
    ? inputSignals.reduce((sum, signal) => sum + wordOverlapRatio(signal, fullText), 0) / inputSignals.length
    : 0;

  const usesMergeFields = /\{\{\s*(first_name|company)\s*\}\}/i.test(fullText);
  const hasGenericOpener = containsAny(fullText, GENERIC_OPENERS);

  let score = clamp(Math.round(coverage * 80 + (usesMergeFields ? 20 : 0)));
  if (hasGenericOpener) score = clamp(score - 25);

  const recommendations: DimensionAnalysis["recommendations"] = [];
  if (score < 70) {
    recommendations.push({
      dimension: "personalization",
      severity: score < 50 ? "high" : "medium",
      message: "Add more personalization — reference the prospect's specific situation, not just their name.",
    });
  }
  if (!usesMergeFields) {
    recommendations.push({
      dimension: "personalization",
      severity: "low",
      message: "Add a {{first_name}} or {{company}} merge field so each send feels one-to-one.",
    });
  }
  if (hasGenericOpener) {
    recommendations.push({
      dimension: "personalization",
      severity: "high",
      message: "Drop generic openers like 'I hope this email finds you well' — they read as mass mail.",
    });
  }

  return { score: { dimension: "personalization", label: "Personalization", score }, recommendations };
}
