import { describe, expect, it } from "vitest";
import { analyzePainPoint } from "@/lib/quality-score/analyzers/pain-point";
import { buildResult } from "./fixtures";

const EMPTY_EMAIL = { subject: "subject", body: "body" };

function resultWithPainPoint(painPoint: string) {
  return buildResult({
    input: { painPoint },
    introduction: EMPTY_EMAIL,
    followUp: EMPTY_EMAIL,
    finalFollowUp: EMPTY_EMAIL,
  });
}

describe("analyzePainPoint (Pain Point Specificity)", () => {
  it('flags a one-word pain point ("marketing") as vague', () => {
    const analysis = analyzePainPoint(resultWithPainPoint("marketing"));
    expect(analysis.score.score).toBeLessThan(40);
    expect(analysis.recommendations.some((r) => r.severity === "warning")).toBe(true);
  });

  it('rates "low website conversions" as moderately specific', () => {
    const analysis = analyzePainPoint(resultWithPainPoint("low website conversions"));
    expect(analysis.score.score).toBeGreaterThanOrEqual(40);
    expect(analysis.score.score).toBeLessThan(70);
  });

  it('rates "low website conversion rates from mobile traffic" as highly specific', () => {
    const analysis = analyzePainPoint(resultWithPainPoint("low website conversion rates from mobile traffic"));
    expect(analysis.score.score).toBeGreaterThanOrEqual(70);
    expect(analysis.strengths.length).toBeGreaterThan(0);
  });

  it("does not flag every short pain point as critical severity", () => {
    const analysis = analyzePainPoint(resultWithPainPoint("marketing"));
    expect(analysis.recommendations.every((r) => r.severity !== "critical")).toBe(true);
  });

  it("treats a missing pain point as a hard defect", () => {
    const analysis = analyzePainPoint(resultWithPainPoint(""));
    expect(analysis.score.score).toBe(0);
    expect(analysis.recommendations[0]?.severity).toBe("critical");
  });
});
