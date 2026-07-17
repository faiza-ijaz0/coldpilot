import type { GeneratedSubjectLine, SubjectLineInput, SubjectLineResult } from "@/types";
import { fillPlaceholders, pickMany } from "@/lib/template-utils";
import { getNicheConfig } from "@/lib/personalization/engine";
import { subjectLineCategories } from "@/lib/subject-lines/categories";
import { subjectLineTemplates } from "@/lib/subject-lines/templates";

const VARIANTS_PER_CATEGORY = 2;

/**
 * Generates at least one subject line per category (10 total across the 5
 * categories at the default rate) by sampling distinct template variants and
 * filling placeholders — nothing is a single hardcoded line, and every call
 * re-samples, so regenerating produces a different set.
 */
export function generateSubjectLines(input: SubjectLineInput): SubjectLineResult {
  const industryLabel = getNicheConfig(input.industry).label;
  const values: Record<string, string> = {
    businessName: input.businessName,
    industry: industryLabel,
    targetAudience: input.targetAudience,
    painPoint: input.painPoint,
    offer: input.offer,
  };

  const subjectLines: GeneratedSubjectLine[] = subjectLineCategories.flatMap((category) => {
    const pool = subjectLineTemplates[category.value];
    const variants = pickMany(pool, VARIANTS_PER_CATEGORY);
    return variants.map((template, index) => ({
      id: `${category.value}-${index}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      category: category.value,
      text: fillPlaceholders(template, values),
    }));
  });

  return {
    id: `subj-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    input,
    subjectLines,
    generatedAt: new Date().toISOString(),
  };
}
