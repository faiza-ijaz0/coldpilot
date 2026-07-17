import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { PageHeader } from "@/components/shared/page-header";
import { ResearchLibrary } from "@/components/research/research-library";

export const metadata: Metadata = {
  title: "Research Library",
  description: "Learn how successful cold outreach works — frameworks, psychology, and mistakes to avoid.",
};

export default function ResearchPage() {
  return (
    <SiteShell>
      <div className="container flex flex-col gap-8 py-10">
        <PageHeader
          eyebrow="Research Library"
          title="Learn what makes outreach work"
          description="Bite-sized, sourced articles on subject lines, personalization, pain points, follow-ups, CTAs, and the mistakes that sink reply rates. Bookmark what's useful and track what you've read."
        />

        <ResearchLibrary />
      </div>
    </SiteShell>
  );
}
