"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ResearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center gap-4 py-24 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <h2 className="text-xl font-semibold">Couldn&apos;t load the research library</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Something went wrong while loading this page. You can try again.
      </p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
