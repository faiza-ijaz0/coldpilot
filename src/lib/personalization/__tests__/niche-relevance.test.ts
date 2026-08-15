import { describe, expect, it } from "vitest";
import { findCrossNicheContamination, getNicheSignatureTerms } from "@/lib/personalization/niche-relevance";
import { nicheList } from "@/lib/personalization/niches";

describe("niche signature terms", () => {
  it("derives a non-empty, mutually exclusive signature set for every registered niche", () => {
    const owner = new Map<string, string>();
    for (const niche of nicheList) {
      const terms = getNicheSignatureTerms(niche.id);
      expect(terms.length).toBeGreaterThan(0);
      for (const term of terms) {
        expect(owner.has(term)).toBe(false);
        owner.set(term, niche.id);
      }
    }
  });

  it("includes the exact terms from the reported Luxury Barbershop / car-dealership bug", () => {
    expect(getNicheSignatureTerms("car-dealerships")).toEqual(expect.arrayContaining(["dealership", "gms"]));
    expect(getNicheSignatureTerms("barbershop")).toEqual(
      expect.arrayContaining(["barbershop", "salon", "haircut", "stylist"])
    );
  });
});

describe("findCrossNicheContamination", () => {
  it("flags dealership terminology in a barbershop-selected sequence", () => {
    const text = "Most dealership GMs deal with slow leads after test drives wrap up.";
    expect(findCrossNicheContamination(text, "barbershop").some((hit) => hit.niche === "car-dealerships")).toBe(true);
  });

  it("flags barbershop terminology in a car-dealership-selected sequence", () => {
    const text = "Most barbershop and salon owners deal with a slow haircut and stylist scheduling problem.";
    expect(findCrossNicheContamination(text, "car-dealerships").some((hit) => hit.niche === "barbershop")).toBe(true);
  });

  it("flags automotive AND barbershop terminology in a real-estate-selected sequence", () => {
    const dealershipText = "Most dealership GMs deal with test drives going cold.";
    expect(findCrossNicheContamination(dealershipText, "real-estate").some((hit) => hit.niche === "car-dealerships")).toBe(
      true
    );

    const barbershopText = "Most barbershop owners deal with stylist scheduling.";
    expect(findCrossNicheContamination(barbershopText, "real-estate").some((hit) => hit.niche === "barbershop")).toBe(true);
  });

  it("finds nothing when the text is genuinely about the selected niche", () => {
    const text = "Most brokers and team leads deal with listings going cold after a showing.";
    expect(findCrossNicheContamination(text, "real-estate")).toEqual([]);
  });

  it("never flags a niche's own vocabulary against itself", () => {
    const text = "Most dealership GMs deal with test drives going cold on the floor during busy weekends.";
    expect(findCrossNicheContamination(text, "car-dealerships")).toEqual([]);
  });
});
