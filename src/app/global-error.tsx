"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground antialiased">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            An unexpected error occurred while rendering the application. Please try again.
          </p>
          {error.digest ? (
            <p className="text-xs text-muted-foreground">Error reference: {error.digest}</p>
          ) : null}
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
