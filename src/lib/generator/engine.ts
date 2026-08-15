import type { EmailSlot, GeneratedEmail, GeneratorInput, GeneratorResult } from "@/types";
import {
  pick,
  fillPlaceholders,
  joinParagraphs,
  findUnresolvedPlaceholders,
  stripUnresolvedPlaceholders,
  capitalizeSentences,
} from "@/lib/template-utils";
import { greetingBank, fallbackGreetingBank, signOffBank, postscriptBank } from "@/lib/generator/voice-bank";
import { finalCtaBank } from "@/lib/generator/cta-bank";
import { subjectBank } from "@/lib/generator/subject-bank";
import { elaborationBank } from "@/lib/generator/elaboration-bank";
import { frameworks } from "@/lib/generator/frameworks";
import { getNicheConfig, buildNicheIntroduction, buildNichePainPoint, buildNicheCta } from "@/lib/personalization/engine";
import { findCrossNicheContamination } from "@/lib/personalization/niche-relevance";
import { hasMetaContent } from "@/lib/generator/content-guard";

const SLOT_LABELS: Record<EmailSlot, string> = {
  introduction: "Email 1 — Introduction",
  "follow-up": "Email 2 — Follow-Up",
  "final-follow-up": "Email 3 — Final Follow-Up",
};

/** Retries before falling back to a safe, niche-agnostic email — a safety net, not the normal path: today's niche banks are self-contained and pass on the first attempt. */
const MAX_GENERATION_ATTEMPTS = 5;

interface IntroExtras {
  personalizedIntro: string;
  industryPainPoint: string;
}

function buildStageSentences(stages: string[][], values: Record<string, string>): string[] {
  return stages.map((stagePool) => fillPlaceholders(pick(stagePool), values));
}

/** Never leaves a `{{first_name}}` (or any other) merge field in the output — falls back to a tone-appropriate opener when no recipient name was supplied. */
function buildGreeting(input: GeneratorInput, values: Record<string, string>): string {
  const firstName = input.recipientFirstName?.trim();
  if (firstName) {
    return fillPlaceholders(pick(greetingBank[input.tone]), { ...values, first_name: firstName });
  }
  return pick(fallbackGreetingBank[input.tone]);
}

/** Final safety net: a template referencing a field the values map doesn't have must never leak `{{field}}` into the output. */
function finalizeText(text: string): string {
  return findUnresolvedPlaceholders(text).length > 0 ? stripUnresolvedPlaceholders(text) : text;
}

/** Same placeholder safety net as `finalizeText`, plus sentence capitalization — a free-text value like an offer starting with "an" can otherwise leave a sentence lowercase. Subject lines skip this: lowercase subjects are an intentional cold-email style, not a defect. */
function finalizeBody(text: string): string {
  return capitalizeSentences(finalizeText(text));
}

function assembleBody(
  stageSentences: string[],
  ctaLine: string,
  input: GeneratorInput,
  values: Record<string, string>,
  extras?: IntroExtras
): string {
  const greeting = buildGreeting(input, values);
  const signOff = fillPlaceholders(pick(signOffBank[input.tone]), values);

  const orderedSentences = [extras?.personalizedIntro, ...stageSentences, extras?.industryPainPoint].filter(
    (sentence): sentence is string => Boolean(sentence)
  );

  let paragraphs: string[];
  if (input.emailLength === "short") {
    paragraphs = [orderedSentences.join(" ")];
  } else {
    paragraphs = orderedSentences;
    if (input.emailLength === "long") {
      const elaboration = fillPlaceholders(pick(elaborationBank), values);
      const lastIndex = paragraphs.length - 1;
      paragraphs[lastIndex] = `${paragraphs[lastIndex]} ${elaboration}`;
    }
  }

  const closing =
    input.emailLength === "long"
      ? `${signOff}\n\n${fillPlaceholders(pick(postscriptBank[input.tone]), values)}`
      : signOff;

  return joinParagraphs([greeting, ...paragraphs, ctaLine, closing]);
}

/** One randomized pass at building an email — may occasionally need a re-roll, so callers go through `buildEmail`, not this directly. */
function buildEmailAttempt(
  slot: EmailSlot,
  stages: string[][],
  input: GeneratorInput,
  values: Record<string, string>,
  delayDays: number
): GeneratedEmail {
  const subject = fillPlaceholders(pick(subjectBank[slot]), values);
  const stageSentences = buildStageSentences(stages, values);
  const ctaLine =
    slot === "final-follow-up"
      ? fillPlaceholders(pick(finalCtaBank[input.ctaType]), values)
      : buildNicheCta(input.industry, input.ctaType, values);
  const extras: IntroExtras | undefined =
    slot === "introduction"
      ? {
          personalizedIntro: buildNicheIntroduction(input.industry, values),
          industryPainPoint: buildNichePainPoint(input.industry, values),
        }
      : undefined;
  const body = assembleBody(stageSentences, ctaLine, input, values, extras);

  return {
    slot,
    label: SLOT_LABELS[slot],
    subject: finalizeText(subject),
    body: finalizeBody(body),
    format: "plain",
    delayDays,
  };
}

/**
 * Blanks out the user's own free-text input before contamination scanning.
 * Without this, a legitimate pain point like "low repeat bookings" would
 * get flagged as barbershop contamination for *any* other niche, purely
 * because the user's own words happen to overlap with another niche's
 * vocabulary — that's not template contamination, it's just what they
 * typed. Only the niche bank's own authored prose should be scanned.
 */
function maskUserValues(text: string, userValues: string[]): string {
  return userValues.reduce((result, value) => {
    const trimmed = value.trim();
    if (!trimmed) return result;
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return result.replace(new RegExp(escaped, "gi"), " ");
  }, text);
}

/** True if the email leaks another niche's vocabulary or reads like research/meta commentary instead of outreach copy. */
function hasContentIssues(email: GeneratedEmail, input: GeneratorInput, values: Record<string, string>): boolean {
  const fullText = `${email.subject} ${email.body}`;
  const scanText = maskUserValues(fullText, [
    values.businessName,
    values.senderName,
    values.painPoint,
    values.targetAudience,
    values.offer,
    input.recipientFirstName ?? "",
  ]);
  return findCrossNicheContamination(scanText, input.industry).length > 0 || hasMetaContent(fullText);
}

/**
 * A minimal, fully niche-agnostic email built only from the user's own
 * input — no niche bank content at all, so it can't be cross-contaminated.
 * Last resort if a niche's own templates somehow keep failing the
 * relevance/content checks after repeated re-rolls.
 */
function buildSafeFallbackEmail(
  slot: EmailSlot,
  input: GeneratorInput,
  values: Record<string, string>,
  delayDays: number
): GeneratedEmail {
  const greeting = buildGreeting(input, values);
  const signOff = fillPlaceholders(pick(signOffBank[input.tone]), values);
  const subject = fillPlaceholders(pick(subjectBank[slot]), values);
  const ctaLine = fillPlaceholders(pick(finalCtaBank[input.ctaType]), values);
  const body = joinParagraphs([
    greeting,
    `Most ${values.targetAudience} deal with ${values.painPoint} more than they'd like — that's exactly what ${values.offer} is built to fix for teams like ${values.businessName}.`,
    ctaLine,
    signOff,
  ]);

  return {
    slot,
    label: SLOT_LABELS[slot],
    subject: finalizeText(subject),
    body: finalizeBody(body),
    format: "plain",
    delayDays,
  };
}

function buildEmail(
  slot: EmailSlot,
  stages: string[][],
  input: GeneratorInput,
  values: Record<string, string>,
  delayDays: number
): GeneratedEmail {
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const email = buildEmailAttempt(slot, stages, input, values, delayDays);
    if (!hasContentIssues(email, input, values)) return email;
  }
  return buildSafeFallbackEmail(slot, input, values, delayDays);
}

/**
 * Randomly selects one of the four outreach frameworks to drive the whole
 * sequence, then composes each email from independently randomized
 * sentence pools — no single email is ever hardcoded. The personalization
 * engine injects an industry-specific opening line, pain-point framing,
 * and CTA on top of that structural arc. Every email is validated against
 * the selected niche before it's returned — see `buildEmail`.
 */
export function generateSequence(input: GeneratorInput): GeneratorResult {
  const framework = pick(frameworks);
  const industryLabel = getNicheConfig(input.industry).label;

  const values: Record<string, string> = {
    businessName: input.businessName,
    // Templates also refer to the business as {{company}} — same value, different wording.
    company: input.businessName,
    senderName: input.senderName,
    industry: industryLabel,
    targetAudience: input.targetAudience,
    painPoint: input.painPoint,
    offer: input.offer,
  };

  const emails: GeneratedEmail[] = [
    buildEmail("introduction", framework.introduction, input, values, 0),
    buildEmail("follow-up", framework.followUp, input, values, pick([3, 4])),
    buildEmail("final-follow-up", framework.finalFollowUp, input, values, pick([7, 8, 9])),
  ];

  return {
    id: `seq-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    input,
    framework: framework.id,
    emails,
    generatedAt: new Date().toISOString(),
  };
}
