import type { CTAType, NicheConfig, NicheId } from "@/types";
import { pick, fillPlaceholders } from "@/lib/template-utils";
import { nicheRegistry } from "@/lib/personalization/niches";

export function getNicheConfig(niche: NicheId): NicheConfig {
  return nicheRegistry[niche];
}

/** Merges a niche's own vocabulary into the fill values so its templates can reference {{audience}}, {{workUnit}}, {{metric}}. */
function withVocabulary(niche: NicheConfig, values: Record<string, string>): Record<string, string> {
  return { ...values, ...niche.vocabulary };
}

/** A personalized opening line for the introduction email. */
export function buildNicheIntroduction(nicheId: NicheId, values: Record<string, string>): string {
  const niche = getNicheConfig(nicheId);
  return fillPlaceholders(pick(niche.introductions), withVocabulary(niche, values));
}

/** An industry-specific framing of the pain point, supplementing the user's own description. */
export function buildNichePainPoint(nicheId: NicheId, values: Record<string, string>): string {
  const niche = getNicheConfig(nicheId);
  return fillPlaceholders(pick(niche.painPoints), withVocabulary(niche, values));
}

/** An industry-specific CTA line for the requested CTA type. */
export function buildNicheCta(nicheId: NicheId, ctaType: CTAType, values: Record<string, string>): string {
  const niche = getNicheConfig(nicheId);
  return fillPlaceholders(pick(niche.ctas[ctaType]), withVocabulary(niche, values));
}
