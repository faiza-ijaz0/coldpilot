import type { ExportableEmail, ExportableSequence } from "@/lib/export/types";
import { formatEmailAsText, formatSequenceAsText } from "@/lib/export/format-text";
import { formatSequenceAsMarkdown } from "@/lib/export/format-markdown";
import { buildSequencePdf } from "@/lib/export/format-pdf";
import { downloadTextFile } from "@/lib/export/download";
import { slugify } from "@/lib/export/slugify";

export type { ExportableEmail, ExportableSequence };

export async function copyAllEmails(sequence: ExportableSequence) {
  await navigator.clipboard.writeText(formatSequenceAsText(sequence));
}

export async function copyIndividualEmail(email: ExportableEmail) {
  await navigator.clipboard.writeText(formatEmailAsText(email));
}

export function exportSequenceAsTxt(sequence: ExportableSequence) {
  downloadTextFile(formatSequenceAsText(sequence), `${slugify(sequence.title)}.txt`, "text/plain;charset=utf-8");
}

export function exportSequenceAsMarkdown(sequence: ExportableSequence) {
  downloadTextFile(
    formatSequenceAsMarkdown(sequence),
    `${slugify(sequence.title)}.md`,
    "text/markdown;charset=utf-8"
  );
}

export async function exportSequenceAsPdf(sequence: ExportableSequence) {
  const doc = await buildSequencePdf(sequence);
  doc.save(`${slugify(sequence.title)}.pdf`);
}
