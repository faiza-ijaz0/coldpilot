import type { NicheConfig, NicheId } from "@/types";
import { saasNiche } from "./saas";
import { agenciesNiche } from "./agencies";
import { carDealershipsNiche } from "./car-dealerships";
import { realEstateNiche } from "./real-estate";
import { healthcareNiche } from "./healthcare";
import { ecommerceNiche } from "./ecommerce";
import { educationNiche } from "./education";
import { barbershopNiche } from "./barbershop";

/**
 * The single place a new niche gets registered. Supporting a new niche is:
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
  barbershopNiche,
];

export const nicheRegistry: Record<NicheId, NicheConfig> = Object.fromEntries(
  nicheList.map((niche) => [niche.id, niche])
) as Record<NicheId, NicheConfig>;
