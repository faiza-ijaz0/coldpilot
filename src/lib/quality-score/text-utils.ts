/** Tokenizes text for overlap/similarity checks, stripping merge fields so {{first_name}} etc. don't skew results. */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\{\{[^}]+\}\}/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Fraction of `source`'s meaningful words (length > 3) that appear anywhere in `target`. */
export function wordOverlapRatio(source: string, target: string): number {
  const sourceTokens = new Set(tokenize(source).filter((word) => word.length > 3));
  if (sourceTokens.size === 0) return 0;
  const targetTokens = new Set(tokenize(target));
  let matches = 0;
  for (const token of sourceTokens) {
    if (targetTokens.has(token)) matches += 1;
  }
  return matches / sourceTokens.size;
}

/** Jaccard similarity between two texts' word sets — used to catch near-duplicate emails. */
export function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersectionSize = 0;
  for (const token of setA) {
    if (setB.has(token)) intersectionSize += 1;
  }
  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

export function containsAny(text: string, phrases: string[]): boolean {
  const lower = text.toLowerCase();
  return phrases.some((phrase) => lower.includes(phrase));
}

export function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Splits an email body into sentence-ish chunks for CTA extraction. */
export function splitSentences(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.?!])\s+/))
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}
