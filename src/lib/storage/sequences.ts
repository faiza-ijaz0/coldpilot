import type { EmailBodyFormat, EmailSlot, NewSequenceInput, SavedSequence, SavedSequenceEmail } from "@/types";
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

/**
 * Deep-clones an existing record with a fresh id and timestamps. Duplicate /
 * "Save as New" look this up from the *raw*, not-yet-normalized record (see
 * `useSavedSequences.duplicateSequence`), so `emails` goes through the same
 * `coerceEmails` defense `normalizeSavedSequence` uses — cloning a malformed
 * legacy record must not crash any more than reading one does.
 */
export function cloneSequenceRecord(original: SavedSequence): SavedSequence {
  const now = new Date().toISOString();
  return {
    ...original,
    id: generateId(),
    name: `${original.name} (Copy)`,
    emails: coerceEmails(original.emails).map((email) => ({ ...email })),
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

const VALID_EMAIL_SLOTS = new Set<EmailSlot>(["introduction", "follow-up", "final-follow-up"]);
const SLOT_FALLBACK_LABEL: Record<EmailSlot, string> = {
  introduction: "Email 1 — Introduction",
  "follow-up": "Email 2 — Follow-Up",
  "final-follow-up": "Email 3 — Final Follow-Up",
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Coerces one persisted email entry into a valid `SavedSequenceEmail`, or
 * `null` if it's corrupted beyond recovery (no usable subject/body text —
 * there's nothing meaningful left to show for that email). Entries with
 * only cosmetic damage (a missing/invalid `slot`, `label`, `format`, or
 * `delayDays`) are repaired in place rather than dropped, since the actual
 * content is still intact. Returns the *same* object reference when the
 * entry was already well-formed, so `coerceEmails` can detect "nothing
 * needed fixing" and preserve referential stability for valid records.
 */
function coerceEmail(value: unknown): SavedSequenceEmail | null {
  if (!isPlainObject(value)) return null;
  const { subject, body } = value;
  if (typeof subject !== "string" || typeof body !== "string") return null;

  const slot = VALID_EMAIL_SLOTS.has(value.slot as EmailSlot) ? (value.slot as EmailSlot) : "introduction";
  const label = typeof value.label === "string" && value.label ? value.label : SLOT_FALLBACK_LABEL[slot];
  const format: EmailBodyFormat = value.format === "html" ? "html" : "plain";
  const delayDays = typeof value.delayDays === "number" && Number.isFinite(value.delayDays) ? value.delayDays : 0;

  const alreadyWellFormed =
    value.slot === slot && value.label === label && value.format === format && value.delayDays === delayDays;
  if (alreadyWellFormed) return value as unknown as SavedSequenceEmail;

  return { slot, label, subject, body, format, delayDays };
}

/**
 * Defends against a corrupted `emails` field on a persisted record — missing,
 * `null`, an object, a string, or an array containing malformed entries —
 * none of which should ever crash the app or wipe out an otherwise-usable
 * record. `emails` that isn't an array at all safely becomes `[]` (the rest
 * of the record — name, business info, score, etc. — is still preserved by
 * the caller); individual unrecoverable entries within an array are dropped
 * one at a time rather than discarding the whole sequence. Returns the
 * original array reference when every entry was already valid, matching
 * `sanitizeSequenceEmails`'s "unchanged in, unchanged out" contract.
 */
function coerceEmails(value: unknown): SavedSequenceEmail[] {
  if (!Array.isArray(value)) return [];

  let changed = false;
  const next: SavedSequenceEmail[] = [];
  for (const entry of value) {
    const coerced = coerceEmail(entry);
    if (coerced === null) {
      changed = true;
      continue;
    }
    if (coerced !== entry) changed = true;
    next.push(coerced);
  }

  return changed ? next : (value as SavedSequenceEmail[]);
}

/**
 * A record with no usable `id` can't be identified, edited, or deleted by
 * anything downstream — there's nothing meaningful left to recover, so
 * (and only so) it's the one case `useSavedSequences` filters out entirely
 * rather than trying to repair. Everything else — even a record missing
 * most of its other fields — is kept and passed through
 * `normalizeSavedSequence`, which repairs what it safely can.
 */
export function isRecoverableSequenceRecord(value: unknown): value is SavedSequence {
  return isPlainObject(value) && typeof value.id === "string" && value.id.length > 0;
}

/**
 * Backfills fields added after a sequence may have been persisted, and
 * repairs a corrupted `emails` field, so older or malformed localStorage
 * records don't crash newer code that assumes they exist. `senderName` was
 * added after `businessName` already existed, so old records fall back to
 * the business name they were generated with. `emails` is defensively
 * coerced via `coerceEmails` rather than assumed to already be a valid
 * array — see that function for the recovery strategy. This function never
 * throws and never drops a record outright; callers are expected to have
 * already filtered out unrecoverable records with `isRecoverableSequenceRecord`.
 */
export function normalizeSavedSequence(sequence: SavedSequence): SavedSequence {
  const needsSenderName = !sequence.senderName;
  const coercedEmails = coerceEmails(sequence.emails);
  const sanitizedEmails = sanitizeSequenceEmails(coercedEmails);
  if (!needsSenderName && sanitizedEmails === sequence.emails) return sequence;
  return {
    ...sequence,
    senderName: needsSenderName ? sequence.businessName : sequence.senderName,
    emails: sanitizedEmails,
  };
}
