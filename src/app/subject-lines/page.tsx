import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { PageHeader } from "@/components/shared/page-header";
import { SubjectLineWorkspace } from "@/components/subject-lines/subject-line-workspace";

export const metadata: Metadata = {
  title: "Subject Lines",
  description: "Generate subject line variations across five proven angles, ready to copy into any sequence.",
};

export default function SubjectLinesPage() {
  return (
    <SiteShell>
      <div className="container flex flex-col gap-8 py-10">
        <PageHeader
          eyebrow="Subject Lines"
          title="Generate subject line variations"
          description="Curiosity, pain point, benefit, personalized, and question based — at least 10 subject lines every time, ready to copy."
        />

        <SubjectLineWorkspace />
      </div>
    </SiteShell>
  );
}
