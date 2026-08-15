import { describe, expect, it } from "vitest";
import { analyzeCta } from "@/lib/quality-score/analyzers/cta";
import { buildResult } from "./fixtures";

function bodyWithCta(cta: string): string {
  return `Hi there,\n\nSome context about the problem and the offer.\n\n${cta}\n\nBest,\nFaiza Ijaz`;
}

describe("analyzeCta", () => {
  it.each(["Let me know.", "Contact me.", "Feel free to reach out."])('flags "%s" as a weak CTA', (weakCta) => {
    const result = buildResult({
      introduction: { subject: "s", body: bodyWithCta(weakCta) },
      followUp: { subject: "s", body: bodyWithCta(weakCta) },
      finalFollowUp: { subject: "s", body: bodyWithCta(weakCta) },
    });
    const analysis = analyzeCta(result);
    expect(analysis.score.score).toBeLessThan(50);
    expect(analysis.recommendations.some((r) => r.message.toLowerCase().includes("let me know"))).toBe(true);
  });

  it("scores a specific, time-bound CTA highly", () => {
    const strongCta = "Worth 15 minutes this week to walk through how it'd map to your funnel?";
    const result = buildResult({
      introduction: { subject: "s", body: bodyWithCta(strongCta) },
      followUp: { subject: "s", body: bodyWithCta(strongCta) },
      finalFollowUp: { subject: "s", body: bodyWithCta(strongCta) },
    });
    const analysis = analyzeCta(result);
    expect(analysis.score.score).toBeGreaterThanOrEqual(80);
    expect(analysis.strengths.length).toBeGreaterThan(0);
  });

  it("detects a repeated CTA across emails", () => {
    const cta = "Worth 15 minutes this week to talk it through?";
    const result = buildResult({
      introduction: { subject: "s", body: bodyWithCta(cta) },
      followUp: { subject: "s", body: bodyWithCta(cta) },
      finalFollowUp: { subject: "s", body: bodyWithCta(cta) },
    });
    const analysis = analyzeCta(result);
    expect(analysis.recommendations.some((r) => r.message.includes("repeats across emails"))).toBe(true);
  });

  it("flags a completely missing CTA", () => {
    const result = buildResult({
      introduction: { subject: "s", body: "" },
      followUp: { subject: "s", body: "" },
      finalFollowUp: { subject: "s", body: "" },
    });
    const analysis = analyzeCta(result);
    expect(analysis.recommendations.some((r) => r.severity === "critical")).toBe(true);
  });
});
