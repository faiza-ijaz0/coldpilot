import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <Reveal className="flex flex-col gap-4 border-b border-border/60 pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2.5">
        {eyebrow ? (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</span>
        ) : null}
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="max-w-2xl text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </Reveal>
  );
}
