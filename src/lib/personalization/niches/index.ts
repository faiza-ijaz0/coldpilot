import type { NicheConfig, NicheId } from "@/types";
import { saasNiche } from "./saas";
import { agenciesNiche } from "./agencies";
import { carDealershipsNiche } from "./car-dealerships";
import { realEstateNiche } from "./real-estate";
import { healthcareNiche } from "./healthcare";
import { ecommerceNiche } from "./ecommerce";
import { educationNiche } from "./education";

/**
 * The single place a new niche gets registered. Supporting an 8th niche is:
 * add `src/lib/personalization/niches/<niche>.ts` exporting a `NicheConfig`,
 * then add it to this list — nothing else in the app needs to change.
 */
export const nicheList: NicheConfig[] = [
  saasNiche,
  agenciesNiche,
  carDealershipsNiche,
  realEstateNiche,
  healthcareNiche,
  ecommerceNiche,
  educationNiche,
];

export const nicheRegistry: Record<NicheId, NicheConfig> = Object.fromEntries(
  nicheList.map((niche) => [niche.id, niche])
) as Record<NicheId, NicheConfig>;
