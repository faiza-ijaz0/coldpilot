import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function CtaSection() {
  return (
    <section className="container pb-24">
      <Reveal className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-premium">
        <div aria-hidden className="glow-blob absolute left-1/2 top-1/2 h-72 w-[36rem] -translate-x-1/2 -translate-y-1/2 opacity-70" />
        <h2 className="relative text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Ready to build your next sequence?
        </h2>
        <p className="relative max-w-lg text-balance text-muted-foreground">
          Jump into the generator and put a researched framework to work in minutes.
        </p>
        <Button asChild size="lg" className="relative gap-2">
          <Link href="/generator">
            Open the generator
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Reveal>
    </section>
  );
}
