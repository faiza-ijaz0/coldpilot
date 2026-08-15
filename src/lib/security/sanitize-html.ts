import DOMPurify from "dompurify";
import { SAFE_URI_REGEXP } from "@/lib/security/safe-url";

/** The only formatting the email editor and preview ever need — everything else (script, iframe, object, embed, style, form, input, button, svg, math, event handlers, ...) is stripped. */
const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "u", "a", "ul", "ol", "li"];
const ALLOWED_ATTR = ["href"];

/**
 * The single sanitizer for every piece of email-editor HTML in the app —
 * pasted content, editor state before it's persisted, and any HTML about
 * to be rendered with `dangerouslySetInnerHTML`. Allowlist-based (not a
 * blocklist/regex scrubber): only the tags/attributes above ever survive,
 * so unknown dangerous elements are rejected by default rather than
 * requiring them to be explicitly blocked. Disallowed tags are stripped
 * but their text content is kept (except script/style, whose content is
 * never executable-safe to keep) — plain text is never destroyed.
 *
 * SSR-safe: DOMPurify needs a real DOM. This app only ever renders real
 * (non-empty) editor HTML client-side after localStorage hydration, so on
 * the server this fails closed to an empty string rather than rendering
 * anything unsanitized.
 */
export function sanitizeEmailHtml(html: string): string {
  if (typeof window === "undefined") return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: SAFE_URI_REGEXP,
  });
}
