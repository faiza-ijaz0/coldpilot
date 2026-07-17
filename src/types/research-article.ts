export type ResearchCategory =
  | "subject-lines"
  | "personalization"
  | "pain-points"
  | "follow-up-psychology"
  | "cta-examples"
  | "outreach-mistakes";

export interface ResearchArticle {
  id: string;
  category: ResearchCategory;
  title: string;
  summary: string;
  readTimeMinutes: number;
  tags: string[];
  keyTakeaways: string[];
  body: string[];
}
