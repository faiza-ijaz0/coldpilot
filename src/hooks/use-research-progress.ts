"use client";

import * as React from "react";

import { useLocalStorageState } from "@/hooks/use-local-storage";

const BOOKMARKS_KEY = "coldpilot:research:bookmarks";
const READ_KEY = "coldpilot:research:read";

export function useResearchProgress() {
  const [bookmarkedIds, setBookmarkedIds] = useLocalStorageState<string[]>(BOOKMARKS_KEY, []);
  const [readIds, setReadIds] = useLocalStorageState<string[]>(READ_KEY, []);

  const toggleBookmark = React.useCallback(
    (id: string) => {
      setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setBookmarkedIds]
  );

  const markAsRead = React.useCallback(
    (id: string) => {
      setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    },
    [setReadIds]
  );

  const toggleRead = React.useCallback(
    (id: string) => {
      setReadIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setReadIds]
  );

  const isBookmarked = React.useCallback((id: string) => bookmarkedIds.includes(id), [bookmarkedIds]);
  const isRead = React.useCallback((id: string) => readIds.includes(id), [readIds]);

  return {
    bookmarkedIds,
    readIds,
    toggleBookmark,
    markAsRead,
    toggleRead,
    isBookmarked,
    isRead,
  };
}
