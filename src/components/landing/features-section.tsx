import { BookOpen, LayoutTemplate, Save, Wand2 } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { FeatureCard } from "@/components/shared/feature-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

const features = [
  {
    icon: Wand2,
    title: "Framework-powered generation",
    description:
      "Every sequence is assembled from researched outreach frameworks like AIDA and PAS, tailored to your business and prospect.",
  },
  {
    icon: BookOpen,
    title: "Research library built in",
    description:
      "Browse the exact frameworks powering your sequences, with sourcing and recommended use cases.",
  },
  {
    icon: LayoutTemplate,
    title: "Multi-step sequences",
    description:
      "Generate full multi-touch sequences with subject lines, delays, and follow-up angles in one pass.",
  },
  {
    icon: Save,
    title: "Save & organize",
    description:
      "Keep every sequence you generate organized by industry, tone, and status so nothing gets lost.",
  },
];

export function FeaturesSection() {
  return (
    <section className="container py-24">
      <SectionHeading
        eyebrow="Why ColdPilot"
        title="Structure beats improvisation"
        description="ColdPilot replaces trial-and-error outreach with a system grounded in outreach research."
      />

      <StaggerGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <StaggerItem key={feature.title}>
            <FeatureCard {...feature} />
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
