import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { getEmailPlainText } from "@/lib/html-utils";
import { findSpamPhrases, hasExcessivePunctuation } from "@/lib/quality-score/spam-signals";
import { clamp, upperCaseRatio } from "@/lib/quality-score/text-utils";

function scoreEmailSpam(text: string): { score: number; hits: string[]; issues: string[] } {
  let score = 100;
  const issues: string[] = [];

  const hits = findSpamPhrases(text);
  if (hits.length > 0) {
    score -= clamp(hits.length * 20, 0, 60);
    issues.push("phrase");
  }
  if (hasExcessivePunctuation(text)) {
    score -= 15;
    issues.push("punctuation");
  }
  const letterCount = text.replace(/[^A-Za-z]/g, "").length;
  if (upperCaseRatio(text) > 0.3 && letterCount > 20) {
    score -= 15;
    issues.push("allcaps");
  }
  if ((text.match(/\$/g) ?? []).length >= 3) {
    score -= 10;
    issues.push("dollar-signs");
  }

  return { score: clamp(score), hits, issues };
}

/**
 * Curated, high-precision phrase/pattern checks only — no broad keyword
 * matching against common cold-email words ("free", "save", "discount")
 * that would flag legitimate outreach as promotional.
 */
export function analyzeSpamLanguage(result: GeneratorResult): DimensionAnalysis {
  const perEmail = result.emails.map((email) => ({
    email,
    ...scoreEmailSpam(`${email.subject} ${getEmailPlainText(email)}`),
  }));

  const score = clamp(Math.round(perEmail.reduce((sum, entry) => sum + entry.score, 0) / perEmail.length));

  const recommendations: DimensionAnalysis["recommendations"] = [];
  const strengths: DimensionAnalysis["strengths"] = [];

  const allHits = Array.from(new Set(perEmail.flatMap((entry) => entry.hits)));
  if (allHits.length > 0) {
    recommendations.push({
      dimension: "spamLanguage",
      severity: "critical",
      message: `Spam-trigger language found (${allHits.slice(0, 3).join(", ")}) — this risks landing in the spam folder.`,
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("punctuation"))) {
    recommendations.push({
      dimension: "spamLanguage",
      severity: "warning",
      message: 'Excessive punctuation (multiple "!", "?", "$") reads as promotional — use it sparingly.',
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("allcaps"))) {
    recommendations.push({
      dimension: "spamLanguage",
      severity: "warning",
      message: "Large stretches of ALL CAPS text read as shouting and hurt deliverability.",
    });
  }
  if (score === 100) {
    strengths.push({ dimension: "spamLanguage", message: "No spam-trigger language detected." });
  }

  return { score: { dimension: "spamLanguage", label: "Spam & Promotional Language", score }, recommendations, strengths };
}
