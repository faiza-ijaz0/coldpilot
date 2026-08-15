/**
 * Structural/stylistic red flags for research-note or meta-commentary voice
 * leaking into customer-facing copy — deliberately small and generic (not
 * tied to any niche), catching patterns like "the top five pain points
 * generally include..." or a raw bullet/numbered list, which read as
 * article notes rather than a cold email.
 */
const META_PATTERNS: RegExp[] = [
  /\btop\s+(three|3|five|5|ten|10)\b/i,
  /\bcommon(ly)?\s+(customer\s+)?pain\s?points?\b/i,
  /\bacross\s+businesses\b/i,
  /\bgenerally\s+(includes?|involves?)\b/i,
  /\b(challenges?|obstacles?)\s+(include|involve)\b/i,
  /\bin\s+this\s+(article|guide|post)\b/i,
  /^\s*[-*•]\s+\S/m,
  /^\s*\d+[.)]\s+\S/m,
];

/** Which meta-content patterns (if any) matched — useful for diagnostics/tests. */
export function findMetaContentIssues(text: string): string[] {
  return META_PATTERNS.filter((pattern) => pattern.test(text)).map((pattern) => pattern.source);
}

export function hasMetaContent(text: string): boolean {
  return META_PATTERNS.some((pattern) => pattern.test(text));
}
