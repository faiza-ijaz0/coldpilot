import type { DimensionAnalysis, GeneratorResult } from "@/types";
import { clamp, tokenize } from "@/lib/quality-score/text-utils";

const GENERIC_SUBJECTS = ["hello", "hi", "checking in", "quick question", "following up", "touching base", "introduction"];

interface SubjectScore {
  score: number;
  issues: string[];
}

function scoreSubject(subject: string): SubjectScore {
  const issues: string[] = [];
  const wordCount = tokenize(subject).length;

  if (wordCount === 0) return { score: 0, issues: ["missing"] };

  let score = 100;

  if (wordCount > 9) {
    score -= 15;
    issues.push("long");
  }
  if (subject.length > 60) {
    score -= 15;
    issues.push("long-chars");
  }

  const normalized = subject.trim().toLowerCase();
  if (GENERIC_SUBJECTS.includes(normalized)) {
    score -= 40;
    issues.push("generic");
  }

  const hasSpecificToken = /\{\{|\d/.test(subject) || wordCount >= 4;
  if (!hasSpecificToken) {
    score -= 20;
    issues.push("vague");
  }

  const upperRatio = (subject.match(/[A-Z]/g)?.length ?? 0) / Math.max(subject.length, 1);
  if (upperRatio > 0.5 && subject.length > 4) {
    score -= 20;
    issues.push("shouty");
  }
  if (/!{2,}|\${2,}|%{2,}/.test(subject)) {
    score -= 15;
    issues.push("spammy-punctuation");
  }

  return { score: clamp(score), issues };
}

export function analyzeSubjectLines(result: GeneratorResult): DimensionAnalysis {
  const perEmail = result.emails.map((email) => ({ email, ...scoreSubject(email.subject) }));
  const score = clamp(Math.round(perEmail.reduce((sum, entry) => sum + entry.score, 0) / perEmail.length));

  const uniqueSubjects = new Set(result.emails.map((email) => email.subject.trim().toLowerCase()));
  const recommendations: DimensionAnalysis["recommendations"] = [];

  const genericEmail = perEmail.find((entry) => entry.issues.includes("generic") || entry.issues.includes("vague"));
  if (genericEmail) {
    recommendations.push({
      dimension: "subjectLine",
      severity: "high",
      message: `Subject line too generic — "${genericEmail.email.subject}" doesn't hint at anything specific.`,
    });
  }
  if (uniqueSubjects.size < result.emails.length) {
    recommendations.push({
      dimension: "subjectLine",
      severity: "medium",
      message: "Subject lines repeat across the sequence — vary them so follow-ups don't look identical in the inbox.",
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("shouty") || entry.issues.includes("spammy-punctuation"))) {
    recommendations.push({
      dimension: "subjectLine",
      severity: "medium",
      message: "Avoid ALL CAPS or excessive punctuation in subject lines — it can trigger spam filters.",
    });
  }
  if (perEmail.some((entry) => entry.issues.includes("long") || entry.issues.includes("long-chars"))) {
    recommendations.push({
      dimension: "subjectLine",
      severity: "low",
      message: "Trim longer subject lines — short ones read better on mobile inboxes.",
    });
  }

  return { score: { dimension: "subjectLine", label: "Subject Line", score }, recommendations };
}
