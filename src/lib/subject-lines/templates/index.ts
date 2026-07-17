import type { SubjectLineCategory } from "@/types";
import { curiosityTemplates } from "./curiosity";
import { painPointTemplates } from "./pain-point";
import { benefitTemplates } from "./benefit";
import { personalizedTemplates } from "./personalized";
import { questionTemplates } from "./question";

/**
 * The single place a new category gets registered. Adding a category is:
 * write a `src/lib/subject-lines/templates/<category>.ts` template pool,
 * add it here, then add its metadata to `../categories.ts`.
 */
export const subjectLineTemplates: Record<SubjectLineCategory, string[]> = {
  curiosity: curiosityTemplates,
  "pain-point": painPointTemplates,
  benefit: benefitTemplates,
  personalized: personalizedTemplates,
  question: questionTemplates,
};
