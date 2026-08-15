import { describe, expect, it } from "vitest";
import { analyzePersonalization } from "@/lib/quality-score/analyzers/personalization";
import { buildResult } from "./fixtures";

const TAILORED_BODY =
  "Hi {{GREETING_NAME}},\n\nMost Series A SaaS founders I talk to are wrestling with low trial-to-paid conversion rates from self-serve signups. Acme Motors caught my eye as a team that could use an AI-powered onboarding sequencer to fix exactly that.\n\nWorth 15 minutes this week to see how it maps to your funnel?\n\nBest,\nFaiza Ijaz";

function tailoredBody(greetingLine: string): string {
  return TAILORED_BODY.replace("Hi {{GREETING_NAME}},", greetingLine);
}

describe("analyzePersonalization", () => {
  it('credits "Hi John" when recipientFirstName is "John"', () => {
    const result = buildResult({
      input: { recipientFirstName: "John" },
      introduction: { subject: "idea for Acme Motors", body: tailoredBody("Hi John,") },
      followUp: { subject: "re: onboarding conversion", body: tailoredBody("Hi John,") },
      finalFollowUp: { subject: "last note from me", body: tailoredBody("Hi John,") },
    });

    const analysis = analyzePersonalization(result);

    expect(analysis.strengths.some((s) => s.message.includes('"John'))).toBe(true);
    expect(analysis.recommendations.some((r) => r.message.includes("doesn't actually appear"))).toBe(false);
    expect(analysis.score.score).toBeGreaterThanOrEqual(80);
  });

  it('does NOT credit "Hi {{first_name}}" even when recipientFirstName is "John"', () => {
    const result = buildResult({
      input: { recipientFirstName: "John" },
      introduction: { subject: "idea for Acme Motors", body: tailoredBody("Hi {{first_name}},") },
      followUp: { subject: "re: onboarding conversion", body: tailoredBody("Hi {{first_name}},") },
      finalFollowUp: { subject: "last note from me", body: tailoredBody("Hi {{first_name}},") },
    });

    const analysis = analyzePersonalization(result);

    expect(analysis.strengths.some((s) => s.message.includes('"John'))).toBe(false);
    expect(analysis.recommendations.some((r) => r.severity === "critical" && r.message.includes("Unresolved merge field"))).toBe(
      true
    );
    expect(analysis.score.score).toBeLessThanOrEqual(20);
  });

  it("credits businessName when the actual name is naturally present, not merely a {{company}} token", () => {
    const result = buildResult({
      introduction: { subject: "idea for Acme Motors", body: tailoredBody("Hi there,") },
      followUp: { subject: "re: onboarding conversion", body: tailoredBody("Hi there,") },
      finalFollowUp: { subject: "last note from me", body: tailoredBody("Hi there,") },
    });

    const analysis = analyzePersonalization(result);
    expect(analysis.recommendations.some((r) => r.message.includes("business name"))).toBe(false);
  });

  it("does NOT credit businessName when only the raw {{company}} token is present", () => {
    const withToken = tailoredBody("Hi there,").replace(/Acme Motors/g, "{{company}}");
    const result = buildResult({
      introduction: { subject: "idea for {{company}}", body: withToken },
      followUp: { subject: "re: onboarding conversion", body: withToken },
      finalFollowUp: { subject: "last note from me", body: withToken },
    });

    const analysis = analyzePersonalization(result);
    expect(analysis.recommendations.some((r) => r.message.includes("business name"))).toBe(true);
    expect(analysis.recommendations.some((r) => r.severity === "critical")).toBe(true);
    expect(analysis.score.score).toBeLessThanOrEqual(20);
  });

  it("does not penalize a missing recipient first name — it scores the remaining signals instead", () => {
    const result = buildResult({
      input: { recipientFirstName: "" },
      introduction: { subject: "idea for Acme Motors", body: tailoredBody("Hi there,") },
      followUp: { subject: "re: onboarding conversion", body: tailoredBody("Hi there,") },
      finalFollowUp: { subject: "last note from me", body: tailoredBody("Hi there,") },
    });

    const analysis = analyzePersonalization(result);
    const nameRecommendation = analysis.recommendations.find((r) => r.message.includes("No recipient first name"));

    expect(nameRecommendation).toBeDefined();
    expect(nameRecommendation?.severity).toBe("info");
    expect(analysis.score.score).toBeGreaterThanOrEqual(80);
  });

  it("scores a genuinely non-personalized sequence low, with multiple warnings", () => {
    const genericBody =
      "Hello,\n\nI hope this email finds you well. I wanted to reach out about our services and see if there's an opportunity to work together.\n\nLet me know if interested.\n\nBest,\nSales Team";
    const result = buildResult({
      introduction: { subject: "Hello", body: genericBody },
      followUp: { subject: "Following up", body: genericBody },
      finalFollowUp: { subject: "Checking in", body: genericBody },
    });

    const analysis = analyzePersonalization(result);
    expect(analysis.score.score).toBeLessThan(40);
    expect(analysis.recommendations.filter((r) => r.severity === "warning").length).toBeGreaterThan(0);
  });
});
