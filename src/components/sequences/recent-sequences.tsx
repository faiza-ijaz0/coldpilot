import { Clock } from "lucide-react";

import type { SavedSequence } from "@/types";
import { frameworkName } from "@/lib/generator/frameworks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface RecentSequencesProps {
  sequences: SavedSequence[];
}

function relativeTime(iso: string): string {
  const diffMinutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

export function RecentSequences({ sequences }: RecentSequencesProps) {
  if (sequences.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Recent sequences</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {sequences.map((sequence) => (
          <Card key={sequence.id} className="w-56 shrink-0">
            <CardContent className="flex flex-col gap-2 p-4">
              <span className="truncate text-sm font-medium">{sequence.name}</span>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="secondary" className="truncate text-xs">
                  {frameworkName(sequence.framework)}
                </Badge>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(sequence.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
