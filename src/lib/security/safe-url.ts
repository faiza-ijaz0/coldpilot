/**
 * The only URL schemes the app will ever create a link for or keep on an
 * `href` after sanitizing. Anything else — `javascript:`, `data:`,
 * `vbscript:`, or an unrecognized/malformed scheme — is rejected.
 */
const SAFE_URL_SCHEMES = new Set(["http:", "https:", "mailto:"]);

/** True only for a well-formed absolute URL using an allowed scheme. Empty/whitespace and schemeless input are rejected, not guessed at. */
export function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    return SAFE_URL_SCHEMES.has(new URL(trimmed).protocol);
  } catch {
    return false;
  }
}

/**
 * The same allowlist, expressed as the URI-validation regex DOMPurify
 * expects — matches its own default pattern shape, narrowed to just
 * http(s)/mailto so sanitized HTML can never keep a `javascript:`/`data:`/
 * `vbscript:` href, and non-scheme values (relative paths, anchors) still
 * pass through untouched.
 */
export const SAFE_URI_REGEXP = /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i;
