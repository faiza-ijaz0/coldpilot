import { describe, expect, it } from "vitest";
import { toExportableSequence } from "@/lib/export/to-exportable-sequence";
import type { SavedSequence } from "@/types";

function buildSequence(overrides?: Partial<SavedSequence>): SavedSequence {
  return {
    id: "seq-1",
    name: "Acme Motors — Series A SaaS founders",
    businessName: "Acme Motors",
    senderName: "Faiza Ijaz",
    recipientFirstName: "John",
    industry: "saas",
    targetAudience: "Series A SaaS founders",
    painPoint: "low trial-to-paid conversion rates from self-serve signups",
    offer: "an AI-powered onboarding sequencer",
    tone: "professional",
    emailLength: "medium",
    ctaType: "quick-reply",
    framework: "AIDA",
    emails: [
      {
        slot: "introduction",
        label: "Email 1 — Introduction",
        subject: "quick question about your funnel",
        body: "Hi John,\n\nIntro body.\n\nBest,\nFaiza Ijaz",
        format: "plain",
        delayDays: 0,
      },
      {
        slot: "follow-up",
        label: "Email 2 — Follow-Up",
        subject: "re: your funnel",
        body: "Hi John,\n\nFollow-up body.\n\nBest,\nFaiza Ijaz",
        format: "plain",
        delayDays: 4,
      },
      {
        slot: "final-follow-up",
        label: "Email 3 — Final Follow-Up",
        subject: "last note from me",
        body: "Hi John,\n\nFinal body.\n\nBest,\nFaiza Ijaz",
        format: "plain",
        delayDays: 8,
      },
    ],
    score: 85,
    status: "draft",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("toExportableSequence", () => {
  it("uses businessName consistently", () => {
    const exportable = toExportableSequence(buildSequence({ businessName: "Acme Motors" }));
    expect(exportable.businessName).toBe("Acme Motors");
  });

  it("preserves targetAudience", () => {
    const exportable = toExportableSequence(buildSequence({ targetAudience: "General Manager" }));
    expect(exportable.targetAudience).toBe("General Manager");
  });

  it("preserves senderName", () => {
    const exportable = toExportableSequence(buildSequence({ senderName: "Faiza Ijaz" }));
    expect(exportable.senderName).toBe("Faiza Ijaz");
  });

  it("preserves recipientFirstName", () => {
    const exportable = toExportableSequence(buildSequence({ recipientFirstName: "John" }));
    expect(exportable.recipientFirstName).toBe("John");
  });

  it("preserves recipientFirstName when absent (undefined, not a placeholder)", () => {
    const exportable = toExportableSequence(buildSequence({ recipientFirstName: undefined }));
    expect(exportable.recipientFirstName).toBeUndefined();
  });

  it("preserves niche/tone/framework metadata", () => {
    const exportable = toExportableSequence(
      buildSequence({ industry: "car-dealerships", tone: "bold", framework: "PAS" })
    );
    expect(exportable.niche).toBe("Car Dealerships");
    expect(exportable.tone).toBe("Bold / Direct");
    expect(exportable.framework).toBe("PAS (Problem, Agitate, Solution)");
  });

  it("preserves all three emails in order", () => {
    const exportable = toExportableSequence(buildSequence());
    expect(exportable.emails).toHaveLength(3);
    expect(exportable.emails.map((email) => email.label)).toEqual([
      "Email 1 — Introduction",
      "Email 2 — Follow-Up",
      "Email 3 — Final Follow-Up",
    ]);
  });

  it("preserves subjects", () => {
    const exportable = toExportableSequence(buildSequence());
    expect(exportable.emails.map((email) => email.subject)).toEqual([
      "quick question about your funnel",
      "re: your funnel",
      "last note from me",
    ]);
  });

  it("preserves timing/delay", () => {
    const exportable = toExportableSequence(buildSequence());
    expect(exportable.emails.map((email) => email.delayDays)).toEqual([0, 4, 8]);
  });

  it("does not mutate the original sequence", () => {
    const sequence = buildSequence();
    const snapshot = JSON.parse(JSON.stringify(sequence));

    toExportableSequence(sequence);

    expect(sequence).toEqual(snapshot);
  });

  it("is deterministic — the same input always produces the same exportable output", () => {
    const sequence = buildSequence();
    const first = toExportableSequence(sequence);
    const second = toExportableSequence(sequence);
    expect(second).toEqual(first);
  });

  describe("regression: title/header must not diverge by call site", () => {
    it("uses the sequence's own name as the title, not a recomputed businessName/targetAudience string", () => {
      const sequence = buildSequence({
        businessName: "Acme Motors",
        targetAudience: "General Manager",
        name: "Q1 Outreach Campaign",
      });

      const exportable = toExportableSequence(sequence);

      // The bug: one call site rebuilt the title as "businessName — targetAudience"
      // while another used sequence.name, producing different documents for the
      // same saved sequence. The canonical transformation must always use
      // sequence.name, regardless of what businessName/targetAudience are.
      expect(exportable.title).toBe("Q1 Outreach Campaign");
      expect(exportable.title).not.toBe("Acme Motors — General Manager");
    });

    it("produces byte-identical output for the same sequence no matter how many times it's called (simulating multiple export entry points)", () => {
      const sequence = buildSequence({
        businessName: "Acme Motors",
        targetAudience: "General Manager",
        name: "Q1 Outreach Campaign",
      });

      const fromGeneratorPage = toExportableSequence(sequence);
      const fromSavedSequencesCard = toExportableSequence(sequence);
      const fromDetailDialog = toExportableSequence(sequence);

      expect(fromSavedSequencesCard).toEqual(fromGeneratorPage);
      expect(fromDetailDialog).toEqual(fromGeneratorPage);
    });
  });
});
