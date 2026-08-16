// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useSavedSequences } from "@/hooks/use-saved-sequences";
import { SEQUENCES_STORAGE_KEY } from "@/lib/storage/sequences";
import type { EmailBodyFormat, NewSequenceInput, SavedSequence } from "@/types";

function buildNewSequenceInput(overrides?: Partial<NewSequenceInput>): NewSequenceInput {
  return {
    name: "Acme Motors — GMs",
    businessName: "Acme Motors",
    senderName: "Faiza Ijaz",
    recipientFirstName: "John",
    industry: "car-dealerships",
    targetAudience: "used-car dealership GMs",
    painPoint: "leads going cold after test drives",
    offer: "an automated follow-up sequencer",
    tone: "professional",
    emailLength: "medium",
    ctaType: "quick-reply",
    framework: "AIDA",
    emails: [
      {
        slot: "introduction",
        label: "Email 1 — Introduction",
        subject: "quick question",
        body: "Hi John,\n\nBody one.\n\nBest,\nFaiza",
        format: "plain" as EmailBodyFormat,
        delayDays: 0,
      },
    ],
    score: 80,
    ...overrides,
  };
}

describe("useSavedSequences — regenerate vs. create identity", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("Generate creates exactly one saved record", () => {
    const { result } = renderHook(() => useSavedSequences());

    act(() => {
      result.current.createSequence(buildNewSequenceInput());
    });

    expect(result.current.sequences).toHaveLength(1);
  });

  it("Regenerate (updateSequence) updates the same record in place — same id and createdAt, fresh updatedAt", async () => {
    const { result } = renderHook(() => useSavedSequences());

    let createdId = "";
    let createdAt = "";
    act(() => {
      const saved = result.current.createSequence(buildNewSequenceInput());
      createdId = saved.id;
      createdAt = saved.createdAt;
    });

    // Ensure updatedAt (an ISO timestamp) would actually differ from createdAt.
    await new Promise((resolve) => setTimeout(resolve, 2));

    act(() => {
      result.current.updateSequence(createdId, {
        emails: [
          {
            slot: "introduction",
            label: "Email 1 — Introduction",
            subject: "regenerated subject",
            body: "Hi John,\n\nRegenerated body.\n\nBest,\nFaiza",
            format: "plain",
            delayDays: 0,
          },
        ],
        score: 91,
        framework: "PAS",
      });
    });

    expect(result.current.sequences).toHaveLength(1);
    const updated = result.current.sequences[0];
    expect(updated.id).toBe(createdId);
    expect(updated.createdAt).toBe(createdAt);
    expect(updated.updatedAt).not.toBe(createdAt);
    expect(updated.score).toBe(91);
    expect(updated.framework).toBe("PAS");
    expect(updated.emails[0]?.subject).toBe("regenerated subject");
  });

  it("five consecutive regenerations still produce exactly one saved record", () => {
    const { result } = renderHook(() => useSavedSequences());

    let id = "";
    act(() => {
      id = result.current.createSequence(buildNewSequenceInput()).id;
    });

    for (let i = 0; i < 5; i += 1) {
      act(() => {
        result.current.updateSequence(id, { score: 70 + i });
      });
    }

    expect(result.current.sequences).toHaveLength(1);
    expect(result.current.sequences[0]?.id).toBe(id);
    expect(result.current.sequences[0]?.score).toBe(74);
  });

  it('"Save as New" (duplicateSequence) creates a second, independent record', () => {
    const { result } = renderHook(() => useSavedSequences());

    let originalId = "";
    act(() => {
      originalId = result.current.createSequence(buildNewSequenceInput()).id;
    });
    act(() => {
      result.current.updateSequence(originalId, { score: 88 });
    });

    let clonedId = "";
    act(() => {
      const cloned = result.current.duplicateSequence(originalId);
      clonedId = cloned?.id ?? "";
    });

    expect(result.current.sequences).toHaveLength(2);
    expect(clonedId).not.toBe("");
    expect(clonedId).not.toBe(originalId);

    const original = result.current.sequences.find((sequence) => sequence.id === originalId);
    const cloned = result.current.sequences.find((sequence) => sequence.id === clonedId);
    expect(original?.score).toBe(88);
    expect(cloned?.score).toBe(88);
    expect(cloned?.businessName).toBe(original?.businessName);

    // Regenerating the clone must not affect the original — they're independent records now.
    act(() => {
      result.current.updateSequence(clonedId, { score: 12 });
    });
    expect(result.current.sequences.find((s) => s.id === originalId)?.score).toBe(88);
    expect(result.current.sequences.find((s) => s.id === clonedId)?.score).toBe(12);
  });

  it('"Duplicate" from the Saved Sequences page creates a second record with its own id/timestamps', () => {
    const { result } = renderHook(() => useSavedSequences());

    let id = "";
    act(() => {
      id = result.current.createSequence(buildNewSequenceInput()).id;
    });

    act(() => {
      result.current.duplicateSequence(id);
    });

    expect(result.current.sequences).toHaveLength(2);
    const ids = result.current.sequences.map((sequence) => sequence.id);
    expect(new Set(ids).size).toBe(2);
  });

  it("delete still works", () => {
    const { result } = renderHook(() => useSavedSequences());

    let id = "";
    act(() => {
      id = result.current.createSequence(buildNewSequenceInput()).id;
    });
    act(() => {
      result.current.createSequence(buildNewSequenceInput({ name: "Second" }));
    });
    expect(result.current.sequences).toHaveLength(2);

    act(() => {
      result.current.deleteSequence(id);
    });

    expect(result.current.sequences).toHaveLength(1);
    expect(result.current.sequences.some((sequence) => sequence.id === id)).toBe(false);
  });

  it("editing a regenerated sequence keeps it attached to the same id", () => {
    const { result } = renderHook(() => useSavedSequences());

    let id = "";
    act(() => {
      id = result.current.createSequence(buildNewSequenceInput()).id;
    });
    act(() => {
      result.current.updateSequence(id, { score: 90 }); // regenerate
    });
    act(() => {
      result.current.updateSequence(id, {
        emails: [
          {
            slot: "introduction",
            label: "Email 1 — Introduction",
            subject: "hand-edited subject",
            body: "Edited body.",
            format: "html",
            delayDays: 0,
          },
        ],
      }); // subsequent manual edit
    });

    expect(result.current.sequences).toHaveLength(1);
    expect(result.current.sequences[0]?.id).toBe(id);
    expect(result.current.sequences[0]?.emails[0]?.subject).toBe("hand-edited subject");
  });

  describe("analytics counts", () => {
    it("regenerating does not increase totalGenerated or the saved-sequence count", () => {
      const { result } = renderHook(() => useSavedSequences());

      let id = "";
      act(() => {
        id = result.current.createSequence(buildNewSequenceInput()).id;
      });
      expect(result.current.totalGenerated).toBe(1);
      expect(result.current.sequences).toHaveLength(1);

      for (let i = 0; i < 5; i += 1) {
        act(() => {
          result.current.updateSequence(id, { score: 50 + i });
        });
      }

      expect(result.current.totalGenerated).toBe(1);
      expect(result.current.sequences).toHaveLength(1);
    });

    it("a genuine new Generate increases totalGenerated and the saved-sequence count", () => {
      const { result } = renderHook(() => useSavedSequences());

      act(() => {
        result.current.createSequence(buildNewSequenceInput());
      });
      act(() => {
        result.current.createSequence(buildNewSequenceInput({ name: "Second sequence" }));
      });

      expect(result.current.totalGenerated).toBe(2);
      expect(result.current.sequences).toHaveLength(2);
    });
  });

  it("refresh (a fresh hook mount) restores the latest regenerated version from localStorage", () => {
    const first = renderHook(() => useSavedSequences());

    let id = "";
    act(() => {
      id = first.result.current.createSequence(buildNewSequenceInput()).id;
    });
    act(() => {
      first.result.current.updateSequence(id, {
        score: 95,
        emails: [
          {
            slot: "introduction",
            label: "Email 1 — Introduction",
            subject: "the latest regenerated subject",
            body: "Latest body.",
            format: "plain",
            delayDays: 0,
          },
        ],
      });
    });

    first.unmount();

    // Simulate a browser refresh: a brand-new hook instance reading the same localStorage.
    const second = renderHook(() => useSavedSequences());

    expect(second.result.current.sequences).toHaveLength(1);
    const restored = second.result.current.sequences[0];
    expect(restored?.id).toBe(id);
    expect(restored?.score).toBe(95);
    expect(restored?.emails[0]?.subject).toBe("the latest regenerated subject");
  });
});

function buildValidRawSequence(overrides?: Partial<SavedSequence>): SavedSequence {
  return {
    id: "seq-valid-1",
    name: "Valid Co",
    businessName: "Valid Co",
    senderName: "Faiza Ijaz",
    recipientFirstName: "",
    industry: "saas",
    targetAudience: "founders",
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
        subject: "subject",
        body: "body",
        format: "plain",
        delayDays: 0,
      },
    ],
    score: 80,
    status: "draft",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

/** Seeds localStorage with exactly what a corrupted/hand-edited record would look like, bypassing the app's own write path entirely — mirrors how real malformed data actually reaches the hook. */
function seedRawSequences(records: unknown[]) {
  window.localStorage.setItem(SEQUENCES_STORAGE_KEY, JSON.stringify(records));
}

describe("useSavedSequences — malformed localStorage resilience", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("does not throw when a saved record's emails field is missing", () => {
    const record: Record<string, unknown> = { ...buildValidRawSequence() };
    delete record.emails;
    seedRawSequences([record]);

    const { result } = renderHook(() => useSavedSequences());

    expect(result.current.sequences).toHaveLength(1);
    expect(result.current.sequences[0]?.emails).toEqual([]);
  });

  it("does not throw when a saved record's emails field is null, and recovers the rest of the record", () => {
    seedRawSequences([{ ...buildValidRawSequence(), emails: null }]);

    const { result } = renderHook(() => useSavedSequences());

    expect(result.current.sequences).toHaveLength(1);
    expect(result.current.sequences[0]?.emails).toEqual([]);
    expect(result.current.sequences[0]?.businessName).toBe("Valid Co");
  });

  it("does not throw when a saved record's emails field is a non-array (object/string/number)", () => {
    for (const emails of [{}, "not an array", 42]) {
      window.localStorage.clear();
      seedRawSequences([{ ...buildValidRawSequence(), emails }]);

      expect(() => renderHook(() => useSavedSequences())).not.toThrow();
    }
  });

  it("does not throw when a saved record contains malformed individual email entries", () => {
    seedRawSequences([
      {
        ...buildValidRawSequence(),
        emails: [null, "not an email", 42, { subject: "ok", body: "ok body" }],
      },
    ]);

    const { result } = renderHook(() => useSavedSequences());

    expect(result.current.sequences).toHaveLength(1);
    expect(result.current.sequences[0]?.emails).toHaveLength(1);
    expect(result.current.sequences[0]?.emails[0]?.subject).toBe("ok");
  });

  it("drops only records with no usable id, while keeping every valid record", () => {
    const valid1 = buildValidRawSequence({ id: "seq-a", name: "First" });
    const valid2 = buildValidRawSequence({ id: "seq-b", name: "Second" });
    seedRawSequences([valid1, null, { foo: "bar" }, "just a string", 42, valid2]);

    const { result } = renderHook(() => useSavedSequences());

    expect(result.current.sequences).toHaveLength(2);
    expect(result.current.sequences.map((sequence) => sequence.id).sort()).toEqual(["seq-a", "seq-b"]);
  });

  it("does not throw when the entire top-level value is not an array", () => {
    window.localStorage.setItem(SEQUENCES_STORAGE_KEY, JSON.stringify({ not: "an array" }));

    expect(() => renderHook(() => useSavedSequences())).not.toThrow();
    const { result } = renderHook(() => useSavedSequences());
    expect(result.current.sequences).toEqual([]);
  });

  it("one malformed record does not affect operations (create/duplicate/delete) on a co-existing valid record", () => {
    const valid = buildValidRawSequence({ id: "seq-valid", name: "Valid" });
    seedRawSequences([valid, { id: "seq-corrupt", emails: null }]);

    const { result } = renderHook(() => useSavedSequences());
    expect(result.current.sequences).toHaveLength(2);

    act(() => {
      result.current.duplicateSequence("seq-valid");
    });
    expect(result.current.sequences).toHaveLength(3);

    act(() => {
      result.current.deleteSequence("seq-valid");
    });
    expect(result.current.sequences.some((sequence) => sequence.id === "seq-valid")).toBe(false);
  });

  it("duplicating a record whose raw emails are malformed does not throw", () => {
    seedRawSequences([{ ...buildValidRawSequence({ id: "seq-corrupt" }), emails: "broken" }]);
    const { result } = renderHook(() => useSavedSequences());

    let clonedIsNull = true;
    let clonedEmailsLength = -1;
    act(() => {
      const cloned = result.current.duplicateSequence("seq-corrupt");
      clonedIsNull = cloned === null;
      clonedEmailsLength = cloned?.emails.length ?? -1;
    });

    expect(clonedIsNull).toBe(false);
    expect(clonedEmailsLength).toBe(0);
    expect(result.current.sequences).toHaveLength(2);
  });
});
