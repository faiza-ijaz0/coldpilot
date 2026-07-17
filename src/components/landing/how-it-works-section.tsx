import { ClipboardList, Library, SendHorizonal } from "lucide-react";

import { SectionHeading } from "@/components/shared/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

const steps = [
  {
    icon: ClipboardList,
    title: "Describe your offer",
    description: "Tell ColdPilot about your product, target persona, and the pain point you solve.",
  },
  {
    icon: Library,
    title: "Pick a framework",
    description: "Choose from researched outreach frameworks tailored to your use case.",
  },
  {
    icon: SendHorizonal,
    title: "Generate & save",
    description: "Get a complete multi-step sequence, ready to save, edit, and send.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="container py-24">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to a full sequence"
          description="From blank page to a ready-to-send sequence in three steps."
        />

        <StaggerGroup className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <StaggerItem key={step.title} className="flex flex-col items-center gap-4 text-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25">
                <step.icon className="h-6 w-6" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-xs font-semibold text-foreground">
                  {index + 1}
                </span>
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
