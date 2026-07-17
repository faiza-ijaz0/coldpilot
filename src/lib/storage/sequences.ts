import type { NewSequenceInput, SavedSequence } from "@/types";

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
