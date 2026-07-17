"use client";

import * as React from "react";
import { Bookmark, Library, Search } from "lucide-react";

import type { ResearchCategory } from "@/types";
import { researchArticles } from "@/lib/research-articles";
import { researchCategories } from "@/lib/research-categories";
import { useResearchProgress } from "@/hooks/use-research-progress";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArticleCard } from "@/components/research/article-card";
import { ResearchProgressOverview } from "@/components/research/research-progress-overview";
import { EmptyState } from "@/components/shared/empty-state";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

type CategoryFilter = ResearchCategory | "all";

export function ResearchLibrary() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<CategoryFilter>("all");
  const [bookmarkedOnly, setBookmarkedOnly] = React.useState(false);

  const { bookmarkedIds, readIds, toggleBookmark, toggleRead, markAsRead, isBookmarked, isRead } =
    useResearchProgress();

  const articles = researchArticles.filter((article) => {
    const matchesCategory = category === "all" || article.category === category;
    const matchesBookmark = !bookmarkedOnly || isBookmarked(article.id);
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 ||
      article.title.toLowerCase().includes(normalizedQuery) ||
      article.summary.toLowerCase().includes(normalizedQuery) ||
      article.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
    return matchesCategory && matchesBookmark && matchesQuery;
  });

  return (
    <div className="flex flex-col gap-6">
      <ResearchProgressOverview
        total={researchArticles.length}
        readCount={readIds.length}
        bookmarkedCount={bookmarkedIds.length}
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={category} onValueChange={(value) => setCategory(value as CategoryFilter)}>
            <TabsList className="flex h-auto flex-wrap justify-start gap-1 bg-muted/60 p-1">
              <TabsTrigger value="all">All</TabsTrigger>
              {researchCategories.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search articles, tags..."
              className="pl-9"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <Button
            variant={bookmarkedOnly ? "secondary" : "outline"}
            size="sm"
            className={cn("gap-1.5", bookmarkedOnly && "border-primary/50")}
            aria-pressed={bookmarkedOnly}
            onClick={() => setBookmarkedOnly((prev) => !prev)}
          >
            <Bookmark className={cn("h-3.5 w-3.5", bookmarkedOnly && "fill-primary text-primary")} />
            Bookmarked only
          </Button>
        </div>
      </div>

      {articles.length > 0 ? (
        <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <StaggerItem key={article.id}>
              <ArticleCard
                article={article}
                isBookmarked={isBookmarked(article.id)}
                isRead={isRead(article.id)}
                onToggleBookmark={toggleBookmark}
                onToggleRead={toggleRead}
                onOpen={markAsRead}
              />
            </StaggerItem>
          ))}
        </StaggerGroup>
      ) : (
        <EmptyState
          icon={Library}
          title="No articles found"
          description="Try a different search term, category, or clear the bookmarked filter."
        />
      )}
    </div>
  );
}
