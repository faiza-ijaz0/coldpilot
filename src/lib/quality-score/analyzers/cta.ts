import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { getEmailPlainText } from "@/lib/html-utils";
import { clamp, splitSentences, tokenize } from "@/lib/quality-score/text-utils";

const CTA_KEYWORDS = [
  "worth a",
  "open to",
  "would you",
  "happy to",
  "let me know",
  "reply",
  "book",
  "grab",
  "call",
  "schedule",
  "15 minutes",
  "10 minutes",
  "no pressure",
];

const WEAK_CTA_PHRASES = [
  "let me know if interested",
  "let me know if you have any questions",
  "no rush",
  "whenever you get a chance",
];

function extractCta(body: string): string | null {
  const candidates = splitSentences(body).filter(
    (sentence) => sentence.endsWith("?") || CTA_KEYWORDS.some((keyword) => sentence.toLowerCase().includes(keyword))
  );
  return candidates.length ? candidates[candidates.length - 1] : null;
}

function scoreCta(cta: string | null): { score: number; issues: string[] } {
  if (!cta) return { score: 15, issues: ["missing"] };

  const issues: string[] = [];
  let score = 70;

  if (cta.trim().endsWith("?")) score += 15;
  if (CTA_KEYWORDS.some((keyword) => cta.toLowerCase().includes(keyword))) score += 10;
  if (WEAK_CTA_PHRASES.some((phrase) => cta.toLowerCase().includes(phrase))) {
    score -= 35;
    issues.push("weak");
  }
  if (tokenize(cta).length > 25) {
    score -= 15;
    issues.push("long");
  }

  return { score: clamp(score), issues };
}

export function analyzeCta(result: GeneratorResult): DimensionAnalysis {
  const perEmail = result.emails.map((email) => {
    const cta = extractCta(getEmailPlainText(email));
    return { email, cta, ...scoreCta(cta) };
  });

  const score = clamp(Math.round(perEmail.reduce((sum, entry) => sum + entry.score, 0) / perEmail.length));

  const ctaTexts = perEmail.map((entry) => entry.cta?.trim().toLowerCase()).filter((text): text is string => Boolean(text));
  const uniqueCtas = new Set(ctaTexts);

  const recommendations: DimensionAnalysis["recommendations"] = [];
  if (perEmail.some((entry) => entry.issues.includes("missing"))) {
    recommendations.push({
      dimension: "cta",
      severity: "high",
      message: "CTA could be stronger — one or more emails don't have a clear next step for the reader.",
    });
  } else if (score < 70) {
    recommendations.push({
      dimension: "cta",
      severity: "medium",
      message: "CTA could be stronger — make the ask more specific (a time, a yes/no question) instead of open-ended.",
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("weak"))) {
    recommendations.push({
      dimension: "cta",
      severity: "medium",
      message: "Replace passive asks like 'let me know if interested' with a concrete, low-effort next step.",
    });
  }
  if (uniqueCtas.size < ctaTexts.length && ctaTexts.length > 1) {
    recommendations.push({
      dimension: "cta",
      severity: "low",
      message: "The same CTA repeats across emails — vary the ask so each touch feels new.",
    });
  }

  return { score: { dimension: "cta", label: "CTA", score }, recommendations };
}
