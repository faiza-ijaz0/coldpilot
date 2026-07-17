import type { CTAType } from "@/types";

/**
 * Lower-pressure, breakup-style variants for the final follow-up. Kept
 * industry-agnostic on purpose — the last touch is deliberately generic
 * and low-pressure regardless of niche. Intro and follow-up CTAs come
 * from the niche-specific banks in `@/lib/personalization`.
 */
export const finalCtaBank: Record<CTAType, string[]> = {
  "book-meeting": [
    "If it's useful, I can still hold 15 minutes this week — otherwise I'll leave it here.",
    "Last note from me on this — happy to grab time if it's still relevant.",
  ],
  "quick-reply": [
    "If it's a no for now, a quick 'not right now' saves us both time.",
    "Totally fine to say the timing's off — just let me know either way.",
  ],
  "phone-call": [
    "If a quick call would help, I'm around — otherwise I'll stop following up.",
    "Happy to call if useful. If not, no hard feelings.",
  ],
  "send-resource": [
    "If it'd help to see the details, say the word — otherwise I'll close the loop here.",
    "Last one from me — want the info, or should I leave it here?",
  ],
  "soft-ask": [
    "I'll leave it here unless you'd like to pick this back up.",
    "No worries if now isn't the time — just didn't want to leave you hanging.",
  ],
};
