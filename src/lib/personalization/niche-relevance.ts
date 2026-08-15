import type { NicheConfig, NicheId } from "@/types";
import { nicheList } from "@/lib/personalization/niches";

/**
 * Generic English function words — not a niche blacklist. Used only to keep
 * connector words ("the", "team", "process") out of the signature-term
 * extraction below, so exclusivity filtering finds genuinely distinctive
 * industry vocabulary instead of common business-writing filler.
 */
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
  "this", "that", "these", "those", "it", "its", "they", "them", "their", "we", "you", "your",
  "of", "in", "on", "at", "to", "for", "from", "with", "without", "by", "as", "if", "so", "than",
  "most", "some", "any", "all", "not", "no", "yes", "just", "only", "also", "still", "right",
  "i", "talk", "talking", "team", "teams", "week", "weeks", "month", "quarter", "process",
  "manual", "follow", "up", "time", "work", "working", "business", "businesses", "one",
  "single", "cause", "obvious", "usually", "rarely", "often", "quietly", "closely", "tends",
]);

function extractWords(text: string, minLength: number): string[] {
  return text
    .toLowerCase()
    .replace(/\{\{[^}]+\}\}/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length >= minLength && !STOPWORDS.has(word));
}

/** The compact, curated words a niche's own dropdown label + vocabulary carry — high-signal even when short (e.g. "GMs"). */
function nicheVocabWords(niche: NicheConfig): string[] {
  const { audience, workUnit, metric } = niche.vocabulary;
  return extractWords(`${niche.label} ${audience} ${workUnit} ${metric}`, 2);
}

/** The niche's own template prose — introductions, pain points, and every CTA variant, with merge fields stripped. */
function nicheProseCorpus(niche: NicheConfig): string {
  const ctaText = Object.values(niche.ctas).flat().join(" ");
  return [...niche.introductions, ...niche.painPoints, ctaText].join(" ");
}

function exclusiveOwner(word: string, wordsByNiche: Map<NicheId, Set<string>>): NicheId | null {
  let owner: NicheId | null = null;
  for (const [nicheId, words] of wordsByNiche) {
    if (words.has(word)) {
      if (owner !== null) return null;
      owner = nicheId;
    }
  }
  return owner;
}

/**
 * For each niche, the set of words/short phrases that belong to it and
 * *only* it — derived entirely from the niche registry itself (labels,
 * vocabulary, and template prose), not a hand-maintained list. A word only
 * qualifies if no other niche's own content uses it, so ordinary shared
 * business language never gets flagged as contamination.
 */
function buildSignatureIndex(): Record<NicheId, Set<string>> {
  // Vocab and prose words are merged into one per-niche pool *before*
  // exclusivity is checked. Splitting them into two independently-exclusive
  // pools would let a word excluded from one pool (because it's shared via
  // a {{audience}}-style placeholder) sneak back in through the other —
  // e.g. "managers" is common to both car-dealerships' and healthcare's
  // vocabulary, but only healthcare spells it out directly in prose; a
  // per-pool check would wrongly treat it as healthcare-exclusive.
  const wordsByNiche = new Map<NicheId, Set<string>>();
  for (const niche of nicheList) {
    wordsByNiche.set(niche.id, new Set([...nicheVocabWords(niche), ...extractWords(nicheProseCorpus(niche), 5)]));
  }

  const byNiche = Object.fromEntries(nicheList.map((niche) => [niche.id, new Set<string>()])) as Record<
    NicheId,
    Set<string>
  >;

  for (const [nicheId, words] of wordsByNiche) {
    for (const word of words) {
      if (exclusiveOwner(word, wordsByNiche) === nicheId) byNiche[nicheId].add(word);
    }
  }

  return byNiche;
}

let cachedIndex: Record<NicheId, Set<string>> | null = null;
function getSignatureIndex(): Record<NicheId, Set<string>> {
  if (!cachedIndex) cachedIndex = buildSignatureIndex();
  return cachedIndex;
}

/** The words/phrases that uniquely identify a niche's own copy — exposed mainly for inspection/tests. */
export function getNicheSignatureTerms(nicheId: NicheId): string[] {
  return Array.from(getSignatureIndex()[nicheId] ?? []);
}

export interface ContaminationHit {
  niche: NicheId;
  terms: string[];
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsWord(text: string, word: string): boolean {
  return new RegExp(`(?<![a-z0-9])${escapeRegExp(word)}(?![a-z0-9])`, "i").test(text);
}

/**
 * Scans generated text for another niche's signature vocabulary leaking
 * into a sequence written for `selectedNiche` — e.g. "dealership" or "GM"
 * showing up in a barbershop sequence. Returns one entry per contaminating
 * niche found, each listing the specific terms that matched.
 */
export function findCrossNicheContamination(text: string, selectedNiche: NicheId): ContaminationHit[] {
  const index = getSignatureIndex();
  const hits: ContaminationHit[] = [];

  for (const niche of nicheList) {
    if (niche.id === selectedNiche) continue;
    const matched = Array.from(index[niche.id]).filter((term) => containsWord(text, term));
    if (matched.length > 0) hits.push({ niche: niche.id, terms: matched });
  }

  return hits;
}
