import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { getNicheConfig } from "@/lib/personalization/engine";
import { findSpamPhrases, hasExcessivePunctuation } from "@/lib/quality-score/spam-signals";
import { clamp, containsPhrase, upperCaseRatio, wordCount, wordOverlapRatio } from "@/lib/quality-score/text-utils";

const GENERIC_SUBJECTS = new Set([
  "hello",
  "hi",
  "checking in",
  "just checking in",
  "quick question",
  "following up",
  "touching base",
  "introduction",
  "hi there",
]);

interface SubjectScore {
  score: number;
  issues: string[];
}

function isRelevant(subject: string, signals: string[]): boolean {
  return signals.some((signal) => signal.trim() && (containsPhrase(subject, signal) || wordOverlapRatio(signal, subject) > 0));
}

function scoreSubject(subject: string, relevanceSignals: string[], personalSignals: string[]): SubjectScore {
  const trimmed = subject.trim();
  if (!trimmed) return { score: 0, issues: ["missing"] };

  const issues: string[] = [];
  let score = 55;

  const normalized = trimmed.toLowerCase();
  const isGeneric = GENERIC_SUBJECTS.has(normalized);
  if (isGeneric) {
    score -= 30;
    issues.push("generic");
  } else if (isRelevant(trimmed, relevanceSignals)) {
    score += 25;
  } else {
    score -= 15;
    issues.push("vague");
  }

  if (personalSignals.some((signal) => signal.trim() && containsPhrase(trimmed, signal))) {
    score += 10;
  }

  const words = wordCount(trimmed);
  if (words > 10) {
    score -= 15;
    issues.push("long");
  } else if (words >= 3 && words <= 8) {
    score += 5;
  }
  if (trimmed.length > 60) {
    score -= 10;
    issues.push("long-chars");
  }

  if (upperCaseRatio(trimmed) > 0.6 && trimmed.replace(/[^A-Za-z]/g, "").length > 4) {
    score -= 25;
    issues.push("shouty");
  }
  if (hasExcessivePunctuation(trimmed)) {
    score -= 20;
    issues.push("spammy-punctuation");
  }
  if (findSpamPhrases(trimmed).length > 0) {
    score -= 25;
    issues.push("spam");
  }

  return { score: clamp(score), issues };
}

export function analyzeSubjectLines(result: GeneratorResult): DimensionAnalysis {
  const { input, emails } = result;
  const nicheLabel = getNicheConfig(input.industry).label;
  const relevanceSignals = [input.painPoint, input.targetAudience, input.offer, input.businessName, nicheLabel];
  const personalSignals = input.recipientFirstName?.trim() ? [input.recipientFirstName] : [];

  const perEmail = emails.map((email) => ({ email, ...scoreSubject(email.subject, relevanceSignals, personalSignals) }));
  const score = clamp(Math.round(perEmail.reduce((sum, entry) => sum + entry.score, 0) / perEmail.length));

  const uniqueSubjects = new Set(emails.map((email) => email.subject.trim().toLowerCase()));
  const recommendations: DimensionAnalysis["recommendations"] = [];
  const strengths: DimensionAnalysis["strengths"] = [];

  if (perEmail.some((entry) => entry.issues.includes("missing"))) {
    recommendations.push({
      dimension: "subjectLine",
      severity: "critical",
      message: "One or more emails has no subject line.",
    });
  }
  const genericEmail = perEmail.find((entry) => entry.issues.includes("generic") || entry.issues.includes("vague"));
  if (genericEmail) {
    recommendations.push({
      dimension: "subjectLine",
      severity: "warning",
      message: `"${genericEmail.email.subject}" doesn't reference anything specific to this prospect — tie it to the pain point, offer, or business.`,
    });
  }
  if (uniqueSubjects.size < emails.length) {
    recommendations.push({
      dimension: "subjectLine",
      severity: "info",
      message: "Subject lines repeat across the sequence — vary them so follow-ups don't look identical in the inbox.",
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("shouty"))) {
    recommendations.push({
      dimension: "subjectLine",
      severity: "warning",
      message: "Avoid ALL CAPS in subject lines — it reads as shouting and can trigger spam filters.",
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("spammy-punctuation") || entry.issues.includes("spam"))) {
    recommendations.push({
      dimension: "subjectLine",
      severity: "critical",
      message: "One or more subject lines use spammy punctuation or promotional language that risks the spam folder.",
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("long") || entry.issues.includes("long-chars"))) {
    recommendations.push({
      dimension: "subjectLine",
      severity: "info",
      message: "Trim longer subject lines — short ones read better on mobile inboxes.",
    });
  }
  if (score >= 85) {
    strengths.push({
      dimension: "subjectLine",
      message: "Subject lines are specific, appropriately short, and free of spam triggers.",
    });
  }

  return { score: { dimension: "subjectLine", label: "Subject Line", score }, recommendations, strengths };
}
