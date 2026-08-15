import { describe, expect, it } from "vitest";
import { scoreSequence } from "@/lib/quality-score/score-engine";
import { generateSequence } from "@/lib/generator/engine";
import { buildResult } from "./fixtures";
import type { GeneratorInput } from "@/types";

const STRONG_INPUT: GeneratorInput = {
  businessName: "Acme Motors",
  senderName: "Faiza Ijaz",
  recipientFirstName: "John",
  industry: "car-dealerships",
  targetAudience: "used-car dealership GMs",
  painPoint: "leads from weekend test drives going cold within 48 hours",
  offer: "an automated 48-hour follow-up sequencer",
  tone: "professional",
  emailLength: "medium",
  ctaType: "book-meeting",
};

const WEAK_BODY =
  "Hello,\n\nI hope this email finds you well. I am writing to introduce our services and see if we can help your business grow.\n\nLet me know if interested.\n\nThanks,\nSales Team";

describe("scoreSequence", () => {
  it("is deterministic — the same sequence always produces the same report", () => {
    const result = generateSequence(STRONG_INPUT);
    const first = scoreSequence(result);
    const second = scoreSequence(result);
    expect(second).toEqual(first);
  });

  it("scores a strong, tailored sequence highly", () => {
    const result = generateSequence(STRONG_INPUT);
    const report = scoreSequence(result);
    expect(report.overall).toBeGreaterThanOrEqual(75);
    expect(report.dimensions).toHaveLength(8);
    expect(report.strengths.length).toBeGreaterThan(0);
  });

  it("scores a generic, unpersonalized sequence well below 60", () => {
    const result = buildResult({
      input: {
        businessName: "Acme Motors",
        senderName: "Sales Team",
        recipientFirstName: "",
        painPoint: "sales",
      },
      introduction: { subject: "Hi", body: WEAK_BODY },
      followUp: { subject: "Checking in", body: WEAK_BODY },
      finalFollowUp: { subject: "Following up", body: WEAK_BODY },
    });
    const report = scoreSequence(result);
    expect(report.overall).toBeLessThan(60);
  });

  it("does not fire the same recommendation universally — a strong sequence has few or no warnings, a weak one has several", () => {
    const strong = scoreSequence(generateSequence(STRONG_INPUT));
    const weak = scoreSequence(
      buildResult({
        input: { painPoint: "sales", recipientFirstName: "" },
        introduction: { subject: "Hi", body: WEAK_BODY },
        followUp: { subject: "Checking in", body: WEAK_BODY },
        finalFollowUp: { subject: "Following up", body: WEAK_BODY },
      })
    );

    const strongCritical = strong.recommendations.filter((r) => r.severity === "critical");
    const weakCritical = weak.recommendations.filter((r) => r.severity === "critical");

    expect(strongCritical.length).toBe(0);
    expect(weakCritical.length).toBeGreaterThan(0);
    expect(weak.recommendations.length).toBeGreaterThan(strong.recommendations.length);
  });

  it("caps the score hard when unresolved placeholders are present, regardless of everything else", () => {
    const withPlaceholders = buildResult({
      input: { recipientFirstName: "John" },
      introduction: { subject: "idea for {{company}}", body: "Hi {{first_name}},\n\nBody.\n\nWorth a look?\n\nBest,\n{{senderName}}" },
      followUp: { subject: "re: {{painPoint}}", body: "Hi {{first_name}},\n\nBody.\n\nWorth a look?\n\nBest,\n{{senderName}}" },
      finalFollowUp: { subject: "last note", body: "Hi {{first_name}},\n\nBody.\n\nWorth a look?\n\nBest,\n{{senderName}}" },
    });
    const report = scoreSequence(withPlaceholders);
    const personalizationDimension = report.dimensions.find((d) => d.dimension === "personalization");
    expect(personalizationDimension?.score).toBeLessThanOrEqual(20);
    expect(report.recommendations.some((r) => r.severity === "critical" && r.message.includes("Unresolved merge field"))).toBe(
      true
    );
  });

  it("produces meaningfully different scores across varied sequences instead of clustering", () => {
    const scores = [
      scoreSequence(generateSequence(STRONG_INPUT)),
      scoreSequence(
        buildResult({
          input: { painPoint: "sales", recipientFirstName: "" },
          introduction: { subject: "Hi", body: WEAK_BODY },
          followUp: { subject: "Checking in", body: WEAK_BODY },
          finalFollowUp: { subject: "Following up", body: WEAK_BODY },
        })
      ),
      scoreSequence(generateSequence({ ...STRONG_INPUT, recipientFirstName: "" })),
    ].map((report) => report.overall);

    const distinctValues = new Set(scores);
    expect(distinctValues.size).toBeGreaterThan(1);
    expect(Math.max(...scores) - Math.min(...scores)).toBeGreaterThan(15);
  });
});
