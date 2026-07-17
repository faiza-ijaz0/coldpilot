import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { PageHeader } from "@/components/shared/page-header";
import { GeneratorWorkspace } from "@/components/generator/generator-workspace";

export const metadata: Metadata = {
  title: "Generator",
  description: "Generate a unique 3-email cold outreach sequence from researched frameworks.",
};

export default function GeneratorPage() {
  return (
    <SiteShell>
      <div className="container flex flex-col gap-8 py-10">
        <PageHeader
          eyebrow="Generator"
          title="Build a new sequence"
          description="Describe your business and prospect — ColdPilot assembles a unique introduction, follow-up, and final follow-up every time."
        />

        <GeneratorWorkspace />
      </div>
    </SiteShell>
  );
}
