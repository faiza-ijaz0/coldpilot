import type { CTAType, EmailBodyFormat, EmailLength, EmailSlot, GeneratorTone, OutreachFramework } from "./generator";
import type { NicheId } from "./personalization";

export type SequenceStatus = "draft" | "active" | "archived";

export interface SavedSequenceEmail {
  slot: EmailSlot;
  label: string;
  subject: string;
  body: string;
  format: EmailBodyFormat;
  delayDays: number;
}

/**
 * A fully self-contained record of one generated sequence — everything
 * needed to display, re-score, re-export, or regenerate from it again
 * lives on this object. This is the single source of truth every page
 * (Generator, Saved Sequences, Analytics) reads from and writes to.
 */
export interface SavedSequence {
  id: string;
  name: string;
  businessName: string;
  industry: NicheId;
  targetAudience: string;
  painPoint: string;
  offer: string;
  tone: GeneratorTone;
  emailLength: EmailLength;
  ctaType: CTAType;
  framework: OutreachFramework;
  emails: SavedSequenceEmail[];
  score: number;
  status: SequenceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewSequenceInput {
  name: string;
  businessName: string;
  industry: NicheId;
  targetAudience: string;
  painPoint: string;
  offer: string;
  tone: GeneratorTone;
  emailLength: EmailLength;
  ctaType: CTAType;
  framework: OutreachFramework;
  emails: SavedSequenceEmail[];
  score: number;
}
