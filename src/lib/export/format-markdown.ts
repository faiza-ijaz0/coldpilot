import type { ExportableSequence } from "@/lib/export/types";
import { dayLabel } from "@/lib/export/day-label";

function bodyToMarkdown(body: string): string {
  return body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\n/g, "  \n"))
    .join("\n\n");
}

export function formatSequenceAsMarkdown(sequence: ExportableSequence): string {
  const lines: string[] = [`# ${sequence.title}`];
  if (sequence.subtitle) lines.push("", `*${sequence.subtitle}*`);
  lines.push("");

  sequence.emails.forEach((email, index) => {
    lines.push(`## ${email.label}`, `**${dayLabel(email.delayDays)}**`, "", `**Subject:** ${email.subject}`, "");
    lines.push(bodyToMarkdown(email.body));
    if (index < sequence.emails.length - 1) lines.push("", "---");
    lines.push("");
  });

  return `${lines.join("\n").trim()}\n`;
}
