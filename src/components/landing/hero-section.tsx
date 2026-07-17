import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="bg-grid-pattern absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]" />
      <div
        aria-hidden
        className="glow-blob absolute left-1/2 top-[-8rem] h-[28rem] w-[42rem] -translate-x-1/2"
      />
      <div
        aria-hidden
        className="glow-blob absolute right-[-10rem] top-1/2 h-72 w-72 opacity-60"
      />

      <StaggerGroup className="container relative flex flex-col items-center gap-8 py-24 text-center sm:py-32">
        <StaggerItem>
          <Badge variant="secondary" className="gap-1.5 px-3 py-1">
            <Sparkles className="h-3.5 w-3.5" />
            Framework-driven, not guesswork
          </Badge>
        </StaggerItem>

        <StaggerItem>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Cold email sequences built on{" "}
            <span className="text-gradient">researched frameworks</span>, not guesswork
          </h1>
        </StaggerItem>

        <StaggerItem>
          <p className="max-w-xl text-balance text-muted-foreground sm:text-lg">
            ColdPilot turns proven outreach frameworks into ready-to-send cold email sequences —
            clear, structured, and built to convert.
          </p>
        </StaggerItem>

        <StaggerItem className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="gap-2">
            <Link href="/generator">
              Start generating
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/research">Browse the research library</Link>
          </Button>
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
