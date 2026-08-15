import type { NewSequenceInput, SavedSequence, SavedSequenceEmail } from "@/types";
import { findUnresolvedPlaceholders, stripUnresolvedPlaceholders } from "@/lib/template-utils";
import { sanitizeEmailHtml } from "@/lib/security/sanitize-html";

export const SEQUENCES_STORAGE_KEY = "coldpilot:sequences";
export const GENERATED_COUNT_STORAGE_KEY = "coldpilot:sequences:generated-count";

function generateId(): string {
  return `seq-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

/** Builds a brand-new, fully-populated sequence record — the only place `id`/timestamps get minted. */
export function buildSequenceRecord(input: NewSequenceInput): SavedSequence {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: input.name.trim() || "Untitled sequence",
    businessName: input.businessName,
    senderName: input.senderName,
    recipientFirstName: input.recipientFirstName,
    industry: input.industry,
    targetAudience: input.targetAudience,
    painPoint: input.painPoint,
    offer: input.offer,
    tone: input.tone,
    emailLength: input.emailLength,
    ctaType: input.ctaType,
    framework: input.framework,
    emails: input.emails,
    score: input.score,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

/** Deep-clones an existing record with a fresh id and timestamps. */
export function cloneSequenceRecord(original: SavedSequence): SavedSequence {
  const now = new Date().toISOString();
  return {
    ...original,
    id: generateId(),
    name: `${original.name} (Copy)`,
    emails: original.emails.map((email) => ({ ...email })),
    createdAt: now,
    updatedAt: now,
  };
}

function sanitizeEmailText(text: string): string {
  return findUnresolvedPlaceholders(text).length > 0 ? stripUnresolvedPlaceholders(text) : text;
}

/**
 * Strips any unresolved `{{field}}` tokens left over from before
 * placeholder resolution was fixed, and re-runs HTML-format bodies through
 * the shared sanitizer — so older saved sequences (persisted before
 * sanitization existed, or edited outside the app) render cleanly and
 * safely instead of leaking merge fields or unsafe markup. Plain-text
 * bodies are left untouched: they're never rendered as HTML, so running
 * them through an HTML sanitizer would only risk mangling literal `<`/`&`
 * characters the user actually typed.
 */
function sanitizeSequenceEmails(emails: SavedSequenceEmail[]): SavedSequenceEmail[] {
  let changed = false;
  const next = emails.map((email) => {
    const subject = sanitizeEmailText(email.subject);
    const placeholdersResolved = sanitizeEmailText(email.body);
    const body = email.format === "html" ? sanitizeEmailHtml(placeholdersResolved) : placeholdersResolved;
    if (subject === email.subject && body === email.body) return email;
    changed = true;
    return { ...email, subject, body };
  });
  return changed ? next : emails;
}

/**
 * Backfills fields added after a sequence may have been persisted, so older
 * localStorage records don't crash newer code that assumes they exist.
 * `senderName` was added after `businessName` already existed, so old
 * records fall back to the business name they were generated with.
 */
export function normalizeSavedSequence(sequence: SavedSequence): SavedSequence {
  const needsSenderName = !sequence.senderName;
  const sanitizedEmails = sanitizeSequenceEmails(sequence.emails);
  if (!needsSenderName && sanitizedEmails === sequence.emails) return sequence;
  return {
    ...sequence,
    senderName: needsSenderName ? sequence.businessName : sequence.senderName,
    emails: sanitizedEmails,
  };
}
