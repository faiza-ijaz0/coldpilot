import { describe, expect, it } from "vitest";
import { generateSubjectLines } from "@/lib/subject-lines/engine";
import { subjectLineTemplates } from "@/lib/subject-lines/templates";
import { subjectLineCategories } from "@/lib/subject-lines/categories";
import { findUnresolvedPlaceholders, resolveTemplate } from "@/lib/template-utils";
import type { SubjectLineInput } from "@/types";

/**
 * Every key a subject-line template is allowed to reference — mirrors the
 * values map built inside generateSubjectLines(). If this list and the
 * engine's values map ever drift apart, the "no unknown key" test below
 * catches it immediately instead of silently leaking a raw {{token}}.
 */
const KNOWN_PLACEHOLDER_KEYS = ["businessName", "company", "industry", "targetAudience", "painPoint", "offer"];

const BASE_INPUT: SubjectLineInput = {
  businessName: "Acme Robotics",
  industry: "saas",
  targetAudience: "operations leads",
  painPoint: "manual follow-up slipping through the cracks",
  offer: "an automated follow-up sequencer",
};

describe("generateSubjectLines — {{company}} resolution", () => {
  it("resolves {{company}} to the business name, never leaving the raw token", () => {
    for (let i = 0; i < 20; i += 1) {
      const result = generateSubjectLines(BASE_INPUT);
      for (const line of result.subjectLines) {
        expect(line.text).not.toContain("{{company}}");
        expect(line.text).not.toContain("{{businessName}}");
      }
    }
  });

  it("reflects the actual business name in company-referencing categories", () => {
    // personalized/curiosity/pain-point/benefit/question templates all reference {{company}}
    // in at least one variant — over enough regenerations, the business name should surface.
    const seenBusinessName = new Set<boolean>();
    for (let i = 0; i < 20; i += 1) {
      const result = generateSubjectLines(BASE_INPUT);
      for (const line of result.subjectLines) {
        seenBusinessName.add(line.text.includes(BASE_INPUT.businessName));
      }
    }
    expect(seenBusinessName.has(true)).toBe(true);
  });
});

describe("generateSubjectLines — no recipient-first-name support", () => {
  it("does not reference {{first_name}} in any template — Subject Lines has no recipient-name input", () => {
    for (const category of subjectLineCategories) {
      for (const template of subjectLineTemplates[category.value]) {
        expect(template).not.toContain("{{first_name}}");
      }
    }
  });

  it("SubjectLineInput intentionally has no recipientFirstName field", () => {
    const input: SubjectLineInput = BASE_INPUT;
    expect("recipientFirstName" in input).toBe(false);
  });
});

describe("generateSubjectLines — no unresolved placeholders reach the UI", () => {
  it("never leaves any unresolved {{...}} token, across varied inputs and many iterations", () => {
    const inputs: SubjectLineInput[] = [
      BASE_INPUT,
      {
        businessName: "O'Brien & Sons, Ltd.",
        industry: "real-estate",
        targetAudience: "home buyers",
        painPoint: "slow response times on new listings",
        offer: "an instant lead-response bot",
      },
      { businessName: "", industry: "barbershop", targetAudience: "walk-in clients", painPoint: "", offer: "" },
      {
        businessName: "日本株式会社 <Café>",
        industry: "ecommerce",
        targetAudience: "online shoppers",
        painPoint: "cart abandonment @ checkout!!",
        offer: "a recovery flow",
      },
      {
        businessName: "A".repeat(300),
        industry: "healthcare",
        targetAudience: "patients",
        painPoint: "no-shows",
        offer: "automated reminders",
      },
      {
        businessName: "Acme, Inc.",
        industry: "education",
        targetAudience: "\"working professionals\"",
        painPoint: "low course completion rates",
        offer: "a completion-nudge sequence",
      },
    ];

    for (const input of inputs) {
      for (let i = 0; i < 15; i += 1) {
        const result = generateSubjectLines(input);
        for (const line of result.subjectLines) {
          expect(
            findUnresolvedPlaceholders(line.text),
            `leaked placeholder in "${line.text}" for input ${JSON.stringify(input)}`
          ).toEqual([]);
          expect(line.text).not.toMatch(/\bundefined\b|\bNaN\b/);
        }
      }
    }
  });

  it("handles an empty businessName without crashing or leaving artifacts", () => {
    const input: SubjectLineInput = { ...BASE_INPUT, businessName: "" };
    for (let i = 0; i < 10; i += 1) {
      const result = generateSubjectLines(input);
      for (const line of result.subjectLines) {
        expect(findUnresolvedPlaceholders(line.text)).toEqual([]);
        expect(line.text.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

describe("subject-line templates — every category, every template", () => {
  it("resolves every raw template in every category with no unresolved placeholder", () => {
    const values: Record<string, string> = {
      businessName: BASE_INPUT.businessName,
      company: BASE_INPUT.businessName,
      industry: "SaaS",
      targetAudience: BASE_INPUT.targetAudience,
      painPoint: BASE_INPUT.painPoint,
      offer: BASE_INPUT.offer,
    };

    for (const category of subjectLineCategories) {
      const templates = subjectLineTemplates[category.value];
      expect(templates.length).toBeGreaterThan(0);
      for (const template of templates) {
        const resolved = resolveTemplate(template, values);
        expect(findUnresolvedPlaceholders(resolved), `template "${template}" left an unresolved placeholder`).toEqual([]);
        expect(resolved.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("never references a placeholder key outside the engine's known values map", () => {
    const placeholderPattern = /\{\{\s*([\w.]+)\s*\}\}/g;
    for (const category of subjectLineCategories) {
      for (const template of subjectLineTemplates[category.value]) {
        const keys = [...template.matchAll(placeholderPattern)].map((match) => match[1]);
        for (const key of keys) {
          expect(KNOWN_PLACEHOLDER_KEYS, `template "${template}" references unknown key {{${key}}}`).toContain(key);
        }
      }
    }
  });

  it("covers every category with a non-empty, evenly distributed set of subject lines", () => {
    const result = generateSubjectLines(BASE_INPUT);
    const counts = subjectLineCategories.map(
      (category) => result.subjectLines.filter((line) => line.category === category.value).length
    );
    expect(counts.every((count) => count > 0)).toBe(true);
    expect(new Set(counts).size).toBe(1);
    expect(result.subjectLines.length).toBe(counts[0] * subjectLineCategories.length);
  });
});

describe("generateSubjectLines — determinism and randomization", () => {
  it("resolveTemplate is a pure, deterministic function for a fixed template and values", () => {
    const template = "quick one about {{company}}";
    const values = { company: "Acme" };
    expect(resolveTemplate(template, values)).toBe("quick one about Acme");
    expect(resolveTemplate(template, values)).toBe(resolveTemplate(template, values));
  });

  it("regenerating the same input produces varied content, not hardcoded lines", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 15; i += 1) {
      const result = generateSubjectLines(BASE_INPUT);
      for (const line of result.subjectLines) seen.add(line.text);
    }
    // more distinct lines observed than a single generation call returns —
    // confirms sampling actually varies across calls rather than being fixed.
    const singleCallCount = generateSubjectLines(BASE_INPUT).subjectLines.length;
    expect(seen.size).toBeGreaterThan(singleCallCount);
  });
});
