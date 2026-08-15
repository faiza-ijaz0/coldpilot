import { describe, expect, it } from "vitest";
import { analyzeSequenceProgression } from "@/lib/quality-score/analyzers/sequence-progression";
import { buildResult } from "./fixtures";

describe("analyzeSequenceProgression", () => {
  it("flags near-duplicate follow-ups", () => {
    const body =
      "Hi there,\n\nMost Series A SaaS founders struggle with low trial-to-paid conversion rates from self-serve signups and it costs them real revenue every quarter.\n\nWorth a look?\n\nBest,\nFaiza Ijaz";
    const result = buildResult({
      introduction: { subject: "s1", body },
      followUp: { subject: "s2", body },
      finalFollowUp: { subject: "s3", body },
    });

    const analysis = analyzeSequenceProgression(result);
    expect(analysis.score.score).toBeLessThan(60);
    expect(
      analysis.recommendations.some((r) => r.severity === "critical" && r.message.includes("nearly identical"))
    ).toBe(true);
  });

  it("rewards a sequence where each email is distinct", () => {
    const result = buildResult({
      introduction: {
        subject: "s1",
        body: "Hi there,\n\nMost Series A SaaS founders I talk to are wrestling with low trial-to-paid conversion rates from self-serve signups.\n\nWorth 15 minutes this week?\n\nBest,\nFaiza Ijaz",
      },
      followUp: {
        subject: "s2",
        body: "Hi there,\n\nWanted to share how a similar team fixed their onboarding drop-off using our sequencer, cutting time-to-value in half.\n\nOpen to a quick call Thursday?\n\nBest,\nFaiza Ijaz",
      },
      finalFollowUp: {
        subject: "s3",
        body: "Hi there,\n\nHaven't heard back, so I'll leave this here for now.\n\nJust reply if the timing changes.\n\nBest,\nFaiza Ijaz",
      },
    });

    const analysis = analyzeSequenceProgression(result);
    expect(analysis.score.score).toBeGreaterThanOrEqual(70);
    expect(analysis.strengths.some((s) => s.message.includes("reads distinctly"))).toBe(true);
  });

  it("flags a sequence missing an email", () => {
    const result = buildResult({
      introduction: { subject: "s1", body: "body" },
      followUp: { subject: "s2", body: "body" },
      finalFollowUp: { subject: "s3", body: "body" },
    });
    result.emails = result.emails.filter((email) => email.slot !== "follow-up");

    const analysis = analyzeSequenceProgression(result);
    expect(analysis.score.score).toBeLessThan(30);
    expect(analysis.recommendations[0]?.severity).toBe("critical");
  });
});
