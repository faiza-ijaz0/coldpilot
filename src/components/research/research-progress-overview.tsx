import { Bookmark, BookOpen, CheckCircle2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ResearchProgressOverviewProps {
  total: number;
  readCount: number;
  bookmarkedCount: number;
}

export function ResearchProgressOverview({
  total,
  readCount,
  bookmarkedCount,
}: ResearchProgressOverviewProps) {
  const percentComplete = total > 0 ? Math.round((readCount / total) * 100) : 0;

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Your progress</span>
            <span className="text-muted-foreground">
              {readCount} of {total} articles read
            </span>
          </div>
          <Progress value={percentComplete} />
        </div>

        <div className="grid grid-cols-3 gap-4 border-t border-border pt-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <BookOpen className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-none">{total}</span>
              <span className="text-xs text-muted-foreground">Articles</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-none">{readCount}</span>
              <span className="text-xs text-muted-foreground">Read</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Bookmark className="h-4 w-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-semibold leading-none">{bookmarkedCount}</span>
              <span className="text-xs text-muted-foreground">Bookmarked</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
