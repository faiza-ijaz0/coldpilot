import Link from "next/link";
import { Compass } from "lucide-react";

import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="container flex flex-col items-center gap-4 py-32 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Compass className="h-6 w-6 text-muted-foreground" />
        </span>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </SiteShell>
  );
}
