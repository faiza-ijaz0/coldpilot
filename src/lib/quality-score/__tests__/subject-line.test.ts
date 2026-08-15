import { describe, expect, it } from "vitest";
import { analyzeSubjectLines } from "@/lib/quality-score/analyzers/subject-line";
import { buildResult } from "./fixtures";

const BODY = "Hi there,\n\nSome relevant body copy.\n\nWorth a look?\n\nBest,\nFaiza Ijaz";

describe("analyzeSubjectLines", () => {
  it("scores a specific, tailored subject line highly", () => {
    const result = buildResult({
      introduction: { subject: "idea for Acme Motors on self-serve onboarding", body: BODY },
      followUp: { subject: "re: low trial-to-paid conversion", body: BODY },
      finalFollowUp: { subject: "should I close the loop on this, Acme Motors?", body: BODY },
    });
    const analysis = analyzeSubjectLines(result);
    expect(analysis.score.score).toBeGreaterThanOrEqual(70);
  });

  it('scores a generic subject line ("Hi") low and flags it', () => {
    const result = buildResult({
      introduction: { subject: "Hi", body: BODY },
      followUp: { subject: "Checking in", body: BODY },
      finalFollowUp: { subject: "Following up", body: BODY },
    });
    const analysis = analyzeSubjectLines(result);
    expect(analysis.score.score).toBeLessThan(50);
    expect(analysis.recommendations.some((r) => r.message.includes("doesn't reference anything specific"))).toBe(true);
  });

  it("penalizes ALL CAPS subject lines", () => {
    const result = buildResult({
      introduction: { subject: "ACT NOW BEFORE YOU MISS THIS", body: BODY },
      followUp: { subject: "re: low trial-to-paid conversion", body: BODY },
      finalFollowUp: { subject: "last note from me", body: BODY },
    });
    const analysis = analyzeSubjectLines(result);
    expect(analysis.recommendations.some((r) => r.message.includes("ALL CAPS"))).toBe(true);
  });

  it("penalizes excessive punctuation and spam phrasing", () => {
    const result = buildResult({
      introduction: { subject: "Act now!!! 100% free!!!", body: BODY },
      followUp: { subject: "re: low trial-to-paid conversion", body: BODY },
      finalFollowUp: { subject: "last note from me", body: BODY },
    });
    const analysis = analyzeSubjectLines(result);
    expect(analysis.recommendations.some((r) => r.severity === "critical")).toBe(true);
  });

  it("flags a missing subject line", () => {
    const result = buildResult({
      introduction: { subject: "", body: BODY },
      followUp: { subject: "re: low trial-to-paid conversion", body: BODY },
      finalFollowUp: { subject: "last note from me", body: BODY },
    });
    const analysis = analyzeSubjectLines(result);
    expect(analysis.recommendations.some((r) => r.severity === "critical" && r.message.includes("no subject line"))).toBe(true);
  });
});
