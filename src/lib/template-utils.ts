/** Picks a random element from a non-empty array. */
export function pick<T>(options: T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

/** Picks up to `count` distinct elements from an array, in random order. */
export function pickMany<T>(options: T[], count: number): T[] {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

/** Fills `{{field}}` placeholders from a values map. Any placeholder with no matching key is left as-is. */
export function fillPlaceholders(text: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    text
  );
}

function placeholderRegex(): RegExp {
  return /\{\{\s*[\w.]+\s*\}\}/g;
}

/** Returns any `{{field}}` tokens still present in text after `fillPlaceholders` — a generated email must never contain these. */
export function findUnresolvedPlaceholders(text: string): string[] {
  return text.match(placeholderRegex()) ?? [];
}

/**
 * Last-resort cleanup for text that still has unresolved `{{field}}` tokens
 * after filling — removes the tokens and tidies the whitespace/punctuation
 * left behind, so a stray or legacy placeholder never reaches the UI.
 */
export function stripUnresolvedPlaceholders(text: string): string {
  return text
    .replace(placeholderRegex(), "")
    .replace(/[ \t]+,/g, ",")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Fills placeholders, then guarantees no `{{field}}` token survives in the result. */
export function resolveTemplate(text: string, values: Record<string, string>): string {
  const filled = fillPlaceholders(text, values);
  return findUnresolvedPlaceholders(filled).length > 0 ? stripUnresolvedPlaceholders(filled) : filled;
}

export function joinParagraphs(paragraphs: string[]): string {
  return paragraphs.filter(Boolean).join("\n\n");
}

/**
 * Capitalizes the first letter at the start of the text and after every
 * sentence/paragraph break — free-text user input (like an offer starting
 * with "an") can leave a sentence starting lowercase once it's dropped into
 * a template, and that reads as sloppy in outreach copy.
 */
export function capitalizeSentences(text: string): string {
  return text.replace(/(^|[.!?]\s+|\n)([a-z])/g, (_match, boundary: string, letter: string) => `${boundary}${letter.toUpperCase()}`);
}
