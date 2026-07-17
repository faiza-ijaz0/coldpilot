import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SavedSequences } from "@/components/sequences/saved-sequences";

export const metadata: Metadata = {
  title: "Saved Sequences",
  description: "Manage the cold outreach sequences you've generated and saved.",
};

export default function SequencesPage() {
  return (
    <SiteShell>
      <div className="container flex flex-col gap-8 py-10">
        <PageHeader
          eyebrow="Saved Sequences"
          title="Your sequences"
          description="Every sequence you've generated, organized by industry, tone, and status."
          actions={
            <Button asChild className="gap-2">
              <Link href="/generator">
                <Plus className="h-4 w-4" />
                New sequence
              </Link>
            </Button>
          }
        />

        <SavedSequences />
      </div>
    </SiteShell>
  );
}
