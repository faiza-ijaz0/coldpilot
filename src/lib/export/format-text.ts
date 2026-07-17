import type { ExportableEmail, ExportableSequence } from "@/lib/export/types";
import { dayLabel } from "@/lib/export/day-label";

const DIVIDER = "─".repeat(48);

export function formatEmailAsText(email: ExportableEmail): string {
  return [`${email.label} — ${dayLabel(email.delayDays)}`, DIVIDER, `Subject: ${email.subject}`, "", email.body].join(
    "\n"
  );
}

export function formatSequenceAsText(sequence: ExportableSequence): string {
  const header = [sequence.title, sequence.subtitle, DIVIDER].filter(Boolean).join("\n");
  const emailBlocks = sequence.emails.map((email) => formatEmailAsText(email));
  return [header, ...emailBlocks].join("\n\n\n");
}
