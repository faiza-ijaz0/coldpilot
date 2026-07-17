import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { PageHeader } from "@/components/shared/page-header";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Usage analytics for your outreach — see what's working and where to focus next.",
};

export default function AnalyticsPage() {
  return (
    <SiteShell>
      <div className="container flex flex-col gap-8 py-10">
        <PageHeader
          eyebrow="Analytics"
          title="Your outreach analytics"
          description="Sequences generated, industries reached, and the tone that performs best for you."
        />

        <AnalyticsDashboard />
      </div>
    </SiteShell>
  );
}
