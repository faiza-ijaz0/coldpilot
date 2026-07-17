import type { LucideIcon } from "lucide-react";
import { Mail, Sparkles, Target, Repeat2, MousePointerClick, ShieldAlert } from "lucide-react";

import type { ResearchCategory } from "@/types";

export interface CategoryMeta {
  value: ResearchCategory;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const researchCategories: CategoryMeta[] = [
  {
    value: "subject-lines",
    label: "Subject Line Frameworks",
    description: "Proven structures that earn the open.",
    icon: Mail,
  },
  {
    value: "personalization",
    label: "Personalization Techniques",
    description: "Make one-to-many outreach feel one-to-one.",
    icon: Sparkles,
  },
  {
    value: "pain-points",
    label: "Pain Point Messaging",
    description: "Lead with the problem, not the pitch.",
    icon: Target,
  },
  {
    value: "follow-up-psychology",
    label: "Follow-Up Psychology",
    description: "Why persistence outperforms a single great email.",
    icon: Repeat2,
  },
  {
    value: "cta-examples",
    label: "Call-To-Action Examples",
    description: "Asks that are easy to say yes to.",
    icon: MousePointerClick,
  },
  {
    value: "outreach-mistakes",
    label: "Outreach Mistakes",
    description: "Common errors that tank reply rates.",
    icon: ShieldAlert,
  },
];

export const researchCategoryMap: Record<ResearchCategory, CategoryMeta> = Object.fromEntries(
  researchCategories.map((category) => [category.value, category])
) as Record<ResearchCategory, CategoryMeta>;
