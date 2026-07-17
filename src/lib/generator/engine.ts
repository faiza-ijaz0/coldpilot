import type { EmailSlot, GeneratedEmail, GeneratorInput, GeneratorResult } from "@/types";
import { pick, fillPlaceholders, joinParagraphs } from "@/lib/template-utils";
import { greetingBank, signOffBank, postscriptBank } from "@/lib/generator/voice-bank";
import { finalCtaBank } from "@/lib/generator/cta-bank";
import { subjectBank } from "@/lib/generator/subject-bank";
import { elaborationBank } from "@/lib/generator/elaboration-bank";
import { frameworks } from "@/lib/generator/frameworks";
import { getNicheConfig, buildNicheIntroduction, buildNichePainPoint, buildNicheCta } from "@/lib/personalization/engine";

const SLOT_LABELS: Record<EmailSlot, string> = {
  introduction: "Email 1 — Introduction",
  "follow-up": "Email 2 — Follow-Up",
  "final-follow-up": "Email 3 — Final Follow-Up",
};

interface IntroExtras {
  personalizedIntro: string;
  industryPainPoint: string;
}

function buildStageSentences(stages: string[][], values: Record<string, string>): string[] {
  return stages.map((stagePool) => fillPlaceholders(pick(stagePool), values));
}

function assembleBody(
  stageSentences: string[],
  ctaLine: string,
  input: GeneratorInput,
  values: Record<string, string>,
  extras?: IntroExtras
): string {
  const greeting = fillPlaceholders(pick(greetingBank[input.tone]), values);
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

function buildEmail(
  slot: EmailSlot,
  stages: string[][],
  input: GeneratorInput,
  values: Record<string, string>,
  delayDays: number,
  extras?: IntroExtras
): GeneratedEmail {
  const subject = fillPlaceholders(pick(subjectBank[slot]), values);
  const stageSentences = buildStageSentences(stages, values);
  const ctaLine =
    slot === "final-follow-up"
      ? fillPlaceholders(pick(finalCtaBank[input.ctaType]), values)
      : buildNicheCta(input.industry, input.ctaType, values);
  const body = assembleBody(stageSentences, ctaLine, input, values, extras);

  return {
    slot,
    label: SLOT_LABELS[slot],
    subject,
    body,
    format: "plain",
    delayDays,
  };
}

/**
 * Randomly selects one of the four outreach frameworks to drive the whole
 * sequence, then composes each email from independently randomized
 * sentence pools — no single email is ever hardcoded. The personalization
 * engine injects an industry-specific opening line, pain-point framing,
 * and CTA on top of that structural arc.
 */
export function generateSequence(input: GeneratorInput): GeneratorResult {
  const framework = pick(frameworks);
  const industryLabel = getNicheConfig(input.industry).label;

  const values: Record<string, string> = {
    businessName: input.businessName,
    industry: industryLabel,
    targetAudience: input.targetAudience,
    painPoint: input.painPoint,
    offer: input.offer,
  };

  const introExtras: IntroExtras = {
    personalizedIntro: buildNicheIntroduction(input.industry, values),
    industryPainPoint: buildNichePainPoint(input.industry, values),
  };

  const emails: GeneratedEmail[] = [
    buildEmail("introduction", framework.introduction, input, values, 0, introExtras),
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
