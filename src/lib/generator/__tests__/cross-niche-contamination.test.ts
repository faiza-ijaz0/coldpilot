import { describe, expect, it, vi } from "vitest";
import { generateSequence } from "@/lib/generator/engine";
import { findCrossNicheContamination } from "@/lib/personalization/niche-relevance";
import { hasMetaContent } from "@/lib/generator/content-guard";
import { findUnresolvedPlaceholders } from "@/lib/template-utils";
import { nicheList } from "@/lib/personalization/niches";
import { frameworks } from "@/lib/generator/frameworks";
import type { GeneratorInput } from "@/types";

/** Mirrors the masking the generator itself applies before contamination-scanning: the user's own free-text input can legitimately contain any words and must not be mistaken for niche-template leakage. */
function maskUserValues(text: string, values: string[]): string {
  return values.reduce((result, value) => {
    const trimmed = value.trim();
    if (!trimmed) return result;
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return result.replace(new RegExp(escaped, "gi"), " ");
  }, text);
}

function scanSequence(input: GeneratorInput, result: ReturnType<typeof generateSequence>) {
  const userValues = [input.businessName, input.senderName, input.painPoint, input.targetAudience, input.offer];
  return result.emails.map((email) => {
    const fullText = `${email.subject} ${email.body}`;
    return {
      email,
      fullText,
      contamination: findCrossNicheContamination(maskUserValues(fullText, userValues), input.industry),
      meta: hasMetaContent(fullText),
      unresolvedPlaceholders: findUnresolvedPlaceholders(fullText),
    };
  });
}

const BASE_INPUT: Omit<GeneratorInput, "industry"> = {
  businessName: "Test Co",
  senderName: "Faiza Ijaz",
  recipientFirstName: "Jordan",
  targetAudience: "operations leads",
  painPoint: "manual follow-up slipping through the cracks",
  offer: "an automated follow-up sequencer",
  tone: "professional",
  emailLength: "medium",
  ctaType: "quick-reply",
};

describe("generated sequences — cross-niche contamination", () => {
  it("produces no cross-niche contamination, meta-content, or unresolved placeholders for any niche", () => {
    for (const niche of nicheList) {
      for (let i = 0; i < 15; i += 1) {
        const input: GeneratorInput = { ...BASE_INPUT, industry: niche.id };
        const result = generateSequence(input);
        for (const check of scanSequence(input, result)) {
          expect(check.contamination, `${niche.id}/${check.email.slot}: ${JSON.stringify(check.contamination)}`).toEqual([]);
          expect(check.meta, `${niche.id}/${check.email.slot} looked like meta-content: ${check.fullText}`).toBe(false);
          expect(check.unresolvedPlaceholders).toEqual([]);
        }
      }
    }
  });

  it("keeps niche content clean across all 4 frameworks explicitly (not just probabilistically)", () => {
    for (let frameworkIndex = 0; frameworkIndex < frameworks.length; frameworkIndex += 1) {
      const randomSpy = vi.spyOn(Math, "random");
      // generateSequence's first pick() call selects the framework — force each index in turn.
      randomSpy.mockReturnValueOnce((frameworkIndex + 0.5) / frameworks.length);

      const input: GeneratorInput = { ...BASE_INPUT, industry: "barbershop" };
      const result = generateSequence(input);
      expect(result.framework).toBe(frameworks[frameworkIndex].id);

      for (const check of scanSequence(input, result)) {
        expect(check.contamination, `framework ${frameworks[frameworkIndex].id}: ${JSON.stringify(check.contamination)}`).toEqual(
          []
        );
      }

      randomSpy.mockRestore();
    }
  });

  it("keeps all three emails internally consistent — same sender, no niche switching mid-sequence", () => {
    const input: GeneratorInput = { ...BASE_INPUT, businessName: "Acme Barbers", industry: "barbershop" };
    const result = generateSequence(input);

    expect(result.emails.map((email) => email.slot)).toEqual(["introduction", "follow-up", "final-follow-up"]);
    for (const check of scanSequence(input, result)) {
      expect(check.fullText).toContain(input.senderName);
      expect(check.contamination).toEqual([]);
    }
  });

  it("lets the user's own pain point appear naturally without being flagged as contamination", () => {
    // "low repeat bookings" legitimately overlaps with the barbershop niche's own vocabulary —
    // selecting a *different* niche with this pain point must not misfire.
    const input: GeneratorInput = { ...BASE_INPUT, industry: "saas", painPoint: "low repeat bookings" };
    const result = generateSequence(input);
    const fullText = result.emails.map((email) => `${email.subject} ${email.body}`).join(" ");

    expect(fullText.toLowerCase()).toMatch(/repeat bookings/);
    for (const check of scanSequence(input, result)) {
      expect(check.contamination).toEqual([]);
    }
  });
});

describe("regression: Luxury Barbershop Chain contamination bug", () => {
  const input: GeneratorInput = {
    businessName: "Luxury Barbershop Chain",
    senderName: "Faiza Ijaz",
    recipientFirstName: "",
    industry: "barbershop",
    targetAudience: "barbershop and salon owners",
    painPoint: "low repeat bookings",
    offer: "an automated rebooking sequencer",
    tone: "professional",
    emailLength: "medium",
    ctaType: "quick-reply",
  };

  it("never produces dealership/automotive contamination, generic research blocks, or unresolved placeholders", () => {
    for (let i = 0; i < 25; i += 1) {
      const result = generateSequence(input);
      const fullText = result.emails.map((email) => `${email.subject} ${email.body}`).join(" ");

      expect(fullText).not.toMatch(/dealership/i);
      expect(fullText).not.toMatch(/\bGMs?\b/);
      expect(fullText).not.toMatch(/sales manager/i);
      expect(fullText).not.toMatch(/vehicle lot/i);
      expect(fullText).not.toMatch(/car dealership/i);
      expect(fullText).not.toMatch(/Email Marketing (&|and) Deliverability/i);
      expect(hasMetaContent(fullText)).toBe(false);
      expect(findUnresolvedPlaceholders(fullText)).toEqual([]);

      // The user's actual pain point should come through naturally.
      expect(fullText.toLowerCase()).toMatch(/repeat bookings|low repeat/);
    }
  });
});
