import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

interface EmphasisBarChartDatum {
  label: string;
  value: number;
}

interface EmphasisBarChartProps {
  icon: LucideIcon;
  title: string;
  data: EmphasisBarChartDatum[];
  emptyTitle: string;
  emptyDescription: string;
}

/**
 * "Emphasis" form: one item (the winner) in the accent hue, the rest in a
 * de-emphasis gray. Each bar is direct-labeled with its own category name
 * and value, so identity comes from the label, not color — no legend needed.
 */
export function EmphasisBarChart({ icon: Icon, title, data, emptyTitle, emptyDescription }: EmphasisBarChartProps) {
  const ranked = data.filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
  const winner = ranked[0];

  return (
    <Card className="hover-lift">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/10">
          <Icon className="h-4 w-4" />
        </span>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {winner ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Most used: <span className="font-semibold text-foreground">{winner.label}</span> ({winner.value}{" "}
              {winner.value === 1 ? "use" : "uses"})
            </p>
            <div className="flex flex-col gap-2.5">
              {ranked.map((item, index) => {
                const isWinner = index === 0;
                const widthPercent = Math.max(6, Math.round((item.value / winner.value) * 100));
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3"
                    title={`${item.label}: ${item.value} ${item.value === 1 ? "use" : "uses"}`}
                  >
                    <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">{item.label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercent}%` }}
                        transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                        className={cn("h-full rounded-full", isWinner ? "bg-primary" : "bg-muted-foreground/30")}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState icon={Icon} title={emptyTitle} description={emptyDescription} />
        )}
      </CardContent>
    </Card>
  );
}
