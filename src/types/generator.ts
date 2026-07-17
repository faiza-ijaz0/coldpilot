import type { NicheId } from "./personalization";

export type GeneratorTone = "professional" | "casual" | "friendly" | "bold" | "formal";

export type EmailLength = "short" | "medium" | "long";

export type CTAType =
  | "book-meeting"
  | "quick-reply"
  | "phone-call"
  | "send-resource"
  | "soft-ask";

export type OutreachFramework = "AIDA" | "PAS" | "BAB" | "PROBLEM_SOLUTION";

export type EmailSlot = "introduction" | "follow-up" | "final-follow-up";

export interface GeneratorInput {
  businessName: string;
  industry: NicheId;
  targetAudience: string;
  painPoint: string;
  offer: string;
  tone: GeneratorTone;
  emailLength: EmailLength;
  ctaType: CTAType;
}

/** "plain" is engine-generated text; "html" means it's been edited in the rich text editor. */
export type EmailBodyFormat = "plain" | "html";

export interface GeneratedEmail {
  slot: EmailSlot;
  label: string;
  subject: string;
  body: string;
  format: EmailBodyFormat;
  delayDays: number;
}

export interface GeneratorResult {
  id: string;
  input: GeneratorInput;
  framework: OutreachFramework;
  emails: GeneratedEmail[];
  generatedAt: string;
}
