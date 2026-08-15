import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { getEmailPlainText } from "@/lib/html-utils";
import { clamp, splitParagraphs, splitSentences, wordCount } from "@/lib/quality-score/text-utils";

/** Exact/near-exact matches only — content-free boilerplate with nothing concrete attached. */
const VAGUE_CTA =
  /^(let me know\.?|just let me know\.?|contact me\.?|feel free to (reach out|get in touch|contact me)\.?|reach out (any ?time|whenever( you (can|get a chance))?)\.?)$/i;
const ACTION_VERB = /\b(book|schedule|grab|reserve|reply|call|chat|hop on|jump on|share|send|start|set up|carve out)\b/i;
const TIME_REFERENCE =
  /\b(\d+\s*-?\s*(minutes?|mins?|hours?|hrs?)|this week|next week|tomorrow|today|monday|tuesday|wednesday|thursday|friday)\b/i;

/**
 * The CTA is structurally the paragraph right before the sign-off — the
 * generator always assembles bodies as [greeting, ...content, ctaLine,
 * closing], so this holds for generated copy and degrades gracefully for
 * hand-edited bodies too, without matching against a fixed phrase bank.
 */
function extractCandidate(body: string): string | null {
  const paragraphs = splitParagraphs(body);
  if (paragraphs.length === 0) return null;
  const candidateParagraph = paragraphs.length >= 2 ? paragraphs[paragraphs.length - 2] : paragraphs[paragraphs.length - 1];
  const sentences = splitSentences(candidateParagraph);
  return sentences.length ? sentences[sentences.length - 1] : candidateParagraph;
}

function scoreCta(cta: string | null): { score: number; issues: string[] } {
  if (!cta || !cta.trim()) return { score: 10, issues: ["missing"] };

  const trimmed = cta.trim();
  if (VAGUE_CTA.test(trimmed)) return { score: 25, issues: ["vague"] };

  const issues: string[] = [];
  let score = 55;

  const endsWithQuestion = trimmed.endsWith("?");
  const hasAction = ACTION_VERB.test(trimmed);
  const hasTime = TIME_REFERENCE.test(trimmed);

  if (endsWithQuestion) score += 15;
  if (hasAction) score += 12;
  if (hasTime) score += 15;
  if (!endsWithQuestion && !hasAction && !hasTime) {
    score -= 15;
    issues.push("unclear");
  }

  if (wordCount(trimmed) > 28) {
    score -= 12;
    issues.push("long");
  }

  return { score: clamp(score), issues };
}

export function analyzeCta(result: GeneratorResult): DimensionAnalysis {
  const perEmail = result.emails.map((email) => {
    const cta = extractCandidate(getEmailPlainText(email));
    return { email, cta, ...scoreCta(cta) };
  });

  const score = clamp(Math.round(perEmail.reduce((sum, entry) => sum + entry.score, 0) / perEmail.length));

  const ctaTexts = perEmail.map((entry) => entry.cta?.trim().toLowerCase()).filter((text): text is string => Boolean(text));
  const uniqueCtas = new Set(ctaTexts);

  const recommendations: DimensionAnalysis["recommendations"] = [];
  const strengths: DimensionAnalysis["strengths"] = [];

  if (perEmail.some((entry) => entry.issues.includes("missing"))) {
    recommendations.push({
      dimension: "cta",
      severity: "critical",
      message: "One or more emails has no clear next step for the reader to take.",
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("vague"))) {
    recommendations.push({
      dimension: "cta",
      severity: "warning",
      message: 'Replace generic asks like "let me know" or "contact me" with a specific, low-effort next step (a time, a yes/no question).',
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("unclear"))) {
    recommendations.push({
      dimension: "cta",
      severity: "info",
      message: "Make the ask more concrete — a specific action, a time frame, or a direct question.",
    });
  }
  if (uniqueCtas.size < ctaTexts.length && ctaTexts.length > 1) {
    recommendations.push({
      dimension: "cta",
      severity: "info",
      message: "The same call-to-action repeats across emails — vary the ask so each touch feels new.",
    });
  }
  if (score >= 85) {
    strengths.push({ dimension: "cta", message: "Each email ends with a clear, specific next step." });
  }

  return { score: { dimension: "cta", label: "CTA", score }, recommendations, strengths };
}
