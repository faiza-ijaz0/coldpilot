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

/**
 * A hand-authored "strong" sequence for tests that need to assert on
 * recommendation counts, not just the overall score. Unlike
 * `generateSequence(STRONG_INPUT)`, this has zero randomness: the three
 * emails are deliberately distinct bodies, so it can never trip the
 * sequence-progression near-duplicate check by chance the way a randomly
 * assembled sequence occasionally can (two of the three sentence pools
 * landing on similar phrasing purely by luck). Every dimension is
 * independently strong by construction — well-personalized, a specific
 * pain point, a clear time-bound CTA, clean subject lines, no spam
 * language — so `scoreSequence` should reliably find nothing to flag.
 */
const STRONG_RESULT = buildResult({
  input: {
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
  },
  introduction: {
    subject: "John, an idea for Acme Motors on weekend lead follow-up",
    body: "Hi John,\n\nMost used-car dealership GMs I talk to are wrestling with leads from weekend test drives going cold within 48 hours — it's the kind of leak that's easy to miss until you total up the lost deals at the end of a month. Acme Motors caught my eye as a dealership hitting exactly that stage of growth.\n\nWorth 15 minutes this week to see how an automated 48-hour follow-up sequencer would map to your floor process?\n\nBest regards,\nFaiza Ijaz",
  },
  followUp: {
    subject: "how one dealership fixed weekend lead follow-up",
    body: "Hi John,\n\nWanted to share a quick example: a similar dealership cut their weekend lead drop-off by triggering automatic follow-up texts the moment a test drive wrapped up, instead of waiting for a rep to circle back on Monday. It's a fairly small operational change but it directly targets the 48-hour cold-lead problem.\n\nOpen to a 10-minute call Thursday to see if the same approach would work for Acme Motors?\n\nBest regards,\nFaiza Ijaz",
  },
  finalFollowUp: {
    subject: "should I close the loop here, John?",
    body: "Hi John,\n\nHaven't heard back, so I'll assume the timing isn't right for Acme Motors at the moment — totally understand if this isn't the top priority right now.\n\nIf it's a no for now, just reply and I'll check back next quarter instead.\n\nBest regards,\nFaiza Ijaz",
  },
});

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
    const strong = scoreSequence(STRONG_RESULT);
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
