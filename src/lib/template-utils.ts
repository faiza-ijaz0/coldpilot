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

/**
 * Fills `{{field}}` placeholders from a values map. Any placeholder with no
 * matching key (e.g. recipient-side merge fields like {{first_name}} or
 * {{company}}) is left untouched — those are resolved later, per-prospect,
 * by the sending tool.
 */
export function fillPlaceholders(text: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    text
  );
}

export function joinParagraphs(paragraphs: string[]): string {
  return paragraphs.filter(Boolean).join("\n\n");
}
