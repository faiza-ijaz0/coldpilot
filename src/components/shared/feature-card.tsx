import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="hover-lift h-full hover:border-primary/40">
      <CardContent className="flex flex-col gap-4 p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/10">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
