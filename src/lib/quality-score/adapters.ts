import type { EmailSlot, GeneratorResult, SavedSequence, SavedSequenceEmail } from "@/types";
import { scoreSequence } from "@/lib/quality-score/score-engine";
import { sanitizeEmailHtml } from "@/lib/security/sanitize-html";

/** Reconstructs the shape `scoreSequence` expects from a persisted sequence record, so any saved sequence can be re-scored after an edit. */
export function toScorableResult(sequence: SavedSequence): GeneratorResult {
  return {
    id: sequence.id,
    input: {
      businessName: sequence.businessName,
      senderName: sequence.senderName,
      recipientFirstName: sequence.recipientFirstName,
      industry: sequence.industry,
      targetAudience: sequence.targetAudience,
      painPoint: sequence.painPoint,
      offer: sequence.offer,
      tone: sequence.tone,
      emailLength: sequence.emailLength,
      ctaType: sequence.ctaType,
    },
    framework: sequence.framework,
    emails: sequence.emails,
    generatedAt: sequence.createdAt,
  };
}

/**
 * Applies an email-body edit to a sequence and re-scores it — the single
 * place this happens, used by both the Generator page and the Saved
 * Sequences page. The body is sanitized here regardless of what the editor
 * already did to it, so nothing unsanitized can reach localStorage through
 * this path even if a future editor or caller forgets to.
 */
export function applyEmailEdit(
  sequence: SavedSequence,
  slot: EmailSlot,
  updates: { subject: string; body: string }
): { emails: SavedSequenceEmail[]; score: number } {
  const sanitizedBody = sanitizeEmailHtml(updates.body);
  const emails = sequence.emails.map((email) =>
    email.slot === slot
      ? { ...email, subject: updates.subject, body: sanitizedBody, format: "html" as const }
      : email
  );
  const report = scoreSequence(toScorableResult({ ...sequence, emails }));
  return { emails, score: report.overall };
}
