import { describe, expect, it } from "vitest";
import { analyzeSpamLanguage } from "@/lib/quality-score/analyzers/spam-language";
import { buildResult } from "./fixtures";

describe("analyzeSpamLanguage", () => {
  it("flags genuinely spammy, promotional language", () => {
    const spammyBody =
      "ACT NOW!!! This is a LIMITED TIME offer — 100% free, no obligation, risk-free! Click here to claim your spot before it's gone!!!";
    const result = buildResult({
      introduction: { subject: "s", body: spammyBody },
      followUp: { subject: "s", body: spammyBody },
      finalFollowUp: { subject: "s", body: spammyBody },
    });

    const analysis = analyzeSpamLanguage(result);
    expect(analysis.score.score).toBeLessThan(50);
    expect(analysis.recommendations.some((r) => r.severity === "critical")).toBe(true);
  });

  it("does not false-positive on ordinary cold-email language mentioning \"free\"", () => {
    const legitBody =
      "Hi there,\n\nMost Series A SaaS founders I talk to are wrestling with low trial-to-paid conversion rates from self-serve signups.\n\nWorth a free 15-minute call this week?\n\nBest,\nFaiza Ijaz";
    const result = buildResult({
      introduction: { subject: "idea for Acme Motors", body: legitBody },
      followUp: { subject: "re: onboarding", body: legitBody },
      finalFollowUp: { subject: "last note from me", body: legitBody },
    });

    const analysis = analyzeSpamLanguage(result);
    expect(analysis.score.score).toBe(100);
    expect(analysis.recommendations.length).toBe(0);
  });
});
