import type { EmailSlot, GeneratedEmail, GeneratorInput, GeneratorResult } from "@/types";

const SLOT_LABELS: Record<EmailSlot, string> = {
  introduction: "Email 1 — Introduction",
  "follow-up": "Email 2 — Follow-Up",
  "final-follow-up": "Email 3 — Final Follow-Up",
};

export const DEFAULT_INPUT: GeneratorInput = {
  businessName: "Acme Motors",
  senderName: "Faiza Ijaz",
  recipientFirstName: "",
  industry: "saas",
  targetAudience: "Series A SaaS founders",
  painPoint: "low trial-to-paid conversion rates from self-serve signups",
  offer: "an AI-powered onboarding sequencer",
  tone: "professional",
  emailLength: "medium",
  ctaType: "quick-reply",
};

export function buildEmail(slot: EmailSlot, subject: string, body: string, delayDays: number): GeneratedEmail {
  return { slot, label: SLOT_LABELS[slot], subject, body, format: "plain", delayDays };
}

interface EmailFixture {
  subject: string;
  body: string;
}

interface BuildResultOptions {
  input?: Partial<GeneratorInput>;
  introduction: EmailFixture;
  followUp: EmailFixture;
  finalFollowUp: EmailFixture;
}

export function buildResult(options: BuildResultOptions): GeneratorResult {
  return {
    id: "seq-test",
    input: { ...DEFAULT_INPUT, ...options.input },
    framework: "AIDA",
    emails: [
      buildEmail("introduction", options.introduction.subject, options.introduction.body, 0),
      buildEmail("follow-up", options.followUp.subject, options.followUp.body, 4),
      buildEmail("final-follow-up", options.finalFollowUp.subject, options.finalFollowUp.body, 8),
    ],
    generatedAt: "2026-01-01T00:00:00.000Z",
  };
}
