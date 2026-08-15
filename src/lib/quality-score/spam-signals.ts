/**
 * Deliberately narrow — multi-word clichés and structural patterns that are
 * near-universal spam/promo markers, not everyday words a legitimate cold
 * email might use ("free", "save", "discount" alone are excluded on purpose
 * to avoid false positives on ordinary outreach copy).
 */
const SPAM_PHRASES = [
  "act now",
  "acting now",
  "limited time",
  "limited-time",
  "risk free",
  "risk-free",
  "no obligation",
  "100% free",
  "totally free",
  "click here",
  "buy now",
  "order now",
  "order today",
  "you've been selected",
  "you have been selected",
  "as seen on",
  "cash bonus",
  "double your",
  "earn extra cash",
  "work from home",
  "guaranteed income",
  "no credit check",
  "you're a winner",
  "you are a winner",
  "you won",
  "congratulations, you",
  "million dollar",
  "make money fast",
  "get rich",
  "no strings attached",
  "satisfaction guaranteed",
  "call now",
  "don't miss out",
  "dont miss out",
  "urgent response",
  "act immediately",
];

export function findSpamPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  return SPAM_PHRASES.filter((phrase) => lower.includes(phrase));
}

/** Multiple "!"/"?" in a row, repeated "$"/"%", or three-plus "!" anywhere in the text. */
export function hasExcessivePunctuation(text: string): boolean {
  return /[!?]{2,}|\${2,}|%{2,}/.test(text) || (text.match(/!/g)?.length ?? 0) >= 3;
}
