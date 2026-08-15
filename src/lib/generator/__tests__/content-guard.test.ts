import { describe, expect, it } from "vitest";
import { findMetaContentIssues, hasMetaContent } from "@/lib/generator/content-guard";

describe("content-guard", () => {
  it("flags research/meta-commentary language", () => {
    expect(hasMetaContent("The top five common pain points across businesses generally include...")).toBe(true);
    expect(hasMetaContent("Common challenges include staffing and scheduling.")).toBe(true);
    expect(hasMetaContent("- First bullet point\n- Second bullet point")).toBe(true);
    expect(hasMetaContent("1. First item\n2. Second item")).toBe(true);
  });

  it("does not flag ordinary outreach copy", () => {
    const legit =
      "Hi John,\n\nMost SaaS founders I talk to are wrestling with low trial-to-paid conversion rates from self-serve signups.\n\nWorth 15 minutes this week?\n\nBest,\nFaiza";
    expect(hasMetaContent(legit)).toBe(false);
  });

  it("does not flag an em-dash sign-off as a bullet list", () => {
    expect(hasMetaContent("— Faiza Ijaz")).toBe(false);
    expect(hasMetaContent("Hi there —\n\nQuick note.\n\n— Faiza")).toBe(false);
  });

  it("does not flag hyphenated compound words mid-sentence", () => {
    expect(hasMetaContent("This is a day-to-day, self-serve, low-effort ask.")).toBe(false);
  });

  it("returns which patterns matched, for diagnostics", () => {
    const issues = findMetaContentIssues("The top 5 challenges include this and that.");
    expect(issues.length).toBeGreaterThan(0);
  });
});
