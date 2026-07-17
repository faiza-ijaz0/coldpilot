import type { NicheId } from "./personalization";

export type SubjectLineCategory = "curiosity" | "pain-point" | "benefit" | "personalized" | "question";

export interface SubjectLineInput {
  businessName: string;
  industry: NicheId;
  targetAudience: string;
  painPoint: string;
  offer: string;
}

export interface GeneratedSubjectLine {
  id: string;
  category: SubjectLineCategory;
  text: string;
}

export interface SubjectLineResult {
  id: string;
  input: SubjectLineInput;
  subjectLines: GeneratedSubjectLine[];
  generatedAt: string;
}
