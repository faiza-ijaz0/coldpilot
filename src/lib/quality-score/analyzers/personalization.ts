import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { getEmailPlainText } from "@/lib/html-utils";
import { getNicheConfig } from "@/lib/personalization/engine";
import { findUnresolvedPlaceholders } from "@/lib/template-utils";
import { clamp, containsPhrase, wordOverlapRatio } from "@/lib/quality-score/text-utils";

interface Signal {
  present: boolean;
  weight: number;
}

/** Overlap-or-verbatim: true if the value's meaningful words show up in the text, or the whole phrase appears verbatim (handles short/edited values where overlap alone under-counts). */
function isReflected(value: string, text: string): boolean {
  if (!value.trim()) return false;
  return wordOverlapRatio(value, text) >= 0.5 || containsPhrase(text, value);
}

/**
 * Scores personalization from the actual resolved input values — never from
 * the presence of literal merge-field text like `{{first_name}}`. An
 * unresolved placeholder is treated as a defect (hard score cap + a
 * critical recommendation), not a signal of personalization.
 */
export function analyzePersonalization(result: GeneratorResult): DimensionAnalysis {
  const { input, emails } = result;
  const fullText = emails.map((email) => `${email.subject}\n${getEmailPlainText(email)}`).join("\n");
  const introduction = emails.find((email) => email.slot === "introduction");
  const greetingLine = introduction ? getEmailPlainText(introduction).split("\n")[0] ?? "" : "";

  const unresolved = findUnresolvedPlaceholders(fullText);
  const recipientFirstName = input.recipientFirstName?.trim();
  const nicheLabel = getNicheConfig(input.industry).label;

  const signals: Record<string, Signal> = {
    businessName: { present: containsPhrase(fullText, input.businessName), weight: 1.5 },
    senderName: { present: containsPhrase(fullText, input.senderName), weight: 1 },
    painPoint: { present: isReflected(input.painPoint, fullText), weight: 1.5 },
    targetAudience: { present: isReflected(input.targetAudience, fullText), weight: 1 },
    offer: { present: isReflected(input.offer, fullText), weight: 1 },
    niche: { present: containsPhrase(fullText, nicheLabel), weight: 0.5 },
  };
  if (recipientFirstName) {
    signals.recipientName = {
      present: containsPhrase(greetingLine, recipientFirstName) || containsPhrase(fullText, recipientFirstName),
      weight: 2,
    };
  }

  const totalWeight = Object.values(signals).reduce((sum, signal) => sum + signal.weight, 0);
  const earnedWeight = Object.values(signals).reduce((sum, signal) => sum + (signal.present ? signal.weight : 0), 0);
  let score = totalWeight > 0 ? clamp(Math.round((earnedWeight / totalWeight) * 100)) : 0;

  const recommendations: DimensionAnalysis["recommendations"] = [];
  const strengths: DimensionAnalysis["strengths"] = [];

  if (unresolved.length > 0) {
    score = Math.min(score, 20);
    recommendations.push({
      dimension: "personalization",
      severity: "critical",
      message: `Unresolved merge field${unresolved.length > 1 ? "s" : ""} found (${Array.from(new Set(unresolved)).slice(0, 3).join(", ")}) — these must never reach the recipient.`,
    });
  }

  if (recipientFirstName) {
    if (signals.recipientName?.present) {
      strengths.push({
        dimension: "personalization",
        message: `Uses the recipient's first name, "${recipientFirstName}," naturally in the greeting.`,
      });
    } else {
      recommendations.push({
        dimension: "personalization",
        severity: "warning",
        message: `"${recipientFirstName}" was provided as the recipient's first name but doesn't actually appear in the email.`,
      });
    }
  } else {
    recommendations.push({
      dimension: "personalization",
      severity: "info",
      message: "No recipient first name was provided — adding one gives a warmer, more personal greeting.",
    });
  }

  if (!signals.businessName.present) {
    recommendations.push({
      dimension: "personalization",
      severity: "warning",
      message: "Your business name doesn't clearly appear anywhere in the sequence.",
    });
  }
  if (!signals.painPoint.present) {
    recommendations.push({
      dimension: "personalization",
      severity: "warning",
      message: "The specific pain point you described isn't clearly reflected in the copy.",
    });
  }
  if (!signals.targetAudience.present && !signals.offer.present) {
    recommendations.push({
      dimension: "personalization",
      severity: "info",
      message: "Neither the target audience nor the offer is clearly reflected in the copy.",
    });
  }

  if (unresolved.length === 0 && score >= 85) {
    strengths.push({
      dimension: "personalization",
      message: "Sequence is clearly tailored to your business, pain point, and offer.",
    });
  }

  return { score: { dimension: "personalization", label: "Personalization", score }, recommendations, strengths };
}
