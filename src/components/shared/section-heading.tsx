import { Reveal } from "@/components/motion/reveal";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  return (
    <Reveal
      className={
        align === "center"
          ? "mx-auto flex max-w-2xl flex-col items-center gap-3 text-center"
          : "flex max-w-2xl flex-col gap-3 text-left"
      }
    >
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">{eyebrow}</span>
      ) : null}
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {description ? (
        <p className="text-balance leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </Reveal>
  );
}
