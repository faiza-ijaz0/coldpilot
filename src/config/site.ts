import type { LucideIcon } from "lucide-react";
import { BarChart3, Library, Send, Sparkles, Type } from "lucide-react";

export const siteConfig = {
  name: "ColdPilot",
  tagline: "Smart Outreach Sequence Generator",
  description:
    "Generate high-converting cold email sequences built on proven outreach frameworks — tailored to your business in seconds.",
  url: "https://coldpilot.app",
  ogImage: "/og.png",
  links: {
    twitter: "https://twitter.com/coldpilot",
    github: "https://github.com/coldpilot",
  },
} as const;

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const mainNav: NavItem[] = [
  {
    title: "Generator",
    href: "/generator",
    icon: Sparkles,
    description: "Build a new cold outreach sequence",
  },
  {
    title: "Research Library",
    href: "/research",
    icon: Library,
    description: "Browse proven outreach frameworks",
  },
  {
    title: "Subject Lines",
    href: "/subject-lines",
    icon: Type,
    description: "Generate subject line variations across five proven angles",
  },
  {
    title: "Saved Sequences",
    href: "/sequences",
    icon: Send,
    description: "Manage your saved sequences",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "See how your outreach is performing",
  },
];
