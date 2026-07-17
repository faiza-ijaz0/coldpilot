"use client";

import * as React from "react";
import { Bookmark, CheckCircle2, ChevronDown, Circle, Clock } from "lucide-react";

import type { ResearchArticle } from "@/types";
import { researchCategoryMap } from "@/lib/research-categories";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ArticleCardProps {
  article: ResearchArticle;
  isBookmarked: boolean;
  isRead: boolean;
  onToggleBookmark: (id: string) => void;
  onToggleRead: (id: string) => void;
  onOpen: (id: string) => void;
}

export function ArticleCard({
  article,
  isBookmarked,
  isRead,
  onToggleBookmark,
  onToggleRead,
  onOpen,
}: ArticleCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const category = researchCategoryMap[article.category];

  function handleToggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next) onOpen(article.id);
  }

  return (
    <Card className={cn("hover-lift flex h-fit flex-col", expanded && "border-primary/50")}>
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <category.icon className="h-3 w-3" />
            {category.label}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
            aria-pressed={isBookmarked}
            onClick={() => onToggleBookmark(article.id)}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-primary text-primary")} />
          </Button>
        </div>

        <button
          type="button"
          onClick={handleToggleExpand}
          className="flex items-start justify-between gap-2 text-left"
          aria-expanded={expanded}
        >
          <span className="flex items-start gap-2 font-semibold leading-snug tracking-tight">
            {isRead ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
            )}
            {article.title}
          </span>
          <ChevronDown
            className={cn(
              "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </button>

        <p className="text-sm text-muted-foreground">{article.summary}</p>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {article.readTimeMinutes} min read
        </div>
      </CardHeader>

      {expanded ? (
        <CardContent className="flex flex-col gap-4 border-t border-border pt-4 animate-fade-in">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Key Takeaways
            </span>
            <ul className="flex flex-col gap-1.5">
              {article.keyTakeaways.map((takeaway) => (
                <li key={takeaway} className="flex gap-2 text-sm">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {takeaway}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
            {article.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          <Button
            variant={isRead ? "secondary" : "outline"}
            size="sm"
            className="w-fit gap-1.5"
            onClick={() => onToggleRead(article.id)}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {isRead ? "Marked as read" : "Mark as read"}
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
