import type { SubjectLineCategory } from "@/types";

export interface SubjectLineCategoryMeta {
  value: SubjectLineCategory;
  label: string;
  description: string;
}

export const subjectLineCategories: SubjectLineCategoryMeta[] = [
  { value: "curiosity", label: "Curiosity Based", description: "Opens a loop the reader has to click to close." },
  { value: "pain-point", label: "Pain Point Based", description: "Names the problem directly." },
  { value: "benefit", label: "Benefit Based", description: "Leads with the outcome or result." },
  { value: "personalized", label: "Personalized", description: "References the recipient specifically." },
  { value: "question", label: "Question Based", description: "Phrased as a direct question." },
];
