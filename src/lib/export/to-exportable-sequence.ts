import type { SavedSequence } from "@/types";
import type { ExportableSequence } from "@/lib/export/types";
import { getNicheConfig } from "@/lib/personalization/engine";
import { frameworkName } from "@/lib/generator/frameworks";
import { toneOptions } from "@/lib/generator/tone-options";
import { getEmailPlainText } from "@/lib/html-utils";

function toneLabel(tone: SavedSequence["tone"]): string {
  return toneOptions.find((option) => option.value === tone)?.label ?? tone;
}

/**
 * The single source of truth for turning a saved sequence into exportable
 * data. Every export entry point (Generator page, Saved Sequences card,
 * Sequence Detail dialog) must go through this so the same sequence always
 * produces the same title, metadata, and content regardless of where
 * Export was clicked. Pure — never mutates `sequence`, never touches
 * storage.
 */
export function toExportableSequence(sequence: SavedSequence): ExportableSequence {
  const niche = getNicheConfig(sequence.industry).label;
  const framework = frameworkName(sequence.framework);

  return {
    title: sequence.name,
    subtitle: `${niche} · ${framework}`,
    businessName: sequence.businessName,
    targetAudience: sequence.targetAudience,
    niche,
    tone: toneLabel(sequence.tone),
    framework,
    senderName: sequence.senderName,
    recipientFirstName: sequence.recipientFirstName,
    emails: sequence.emails.map((email) => ({
      label: email.label,
      subject: email.subject,
      body: getEmailPlainText(email),
      delayDays: email.delayDays,
    })),
  };
}
