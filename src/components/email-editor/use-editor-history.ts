"use client";

import * as React from "react";

/**
 * A manual undo/redo stack for contentEditable HTML snapshots. Discrete
 * actions (toolbar clicks) commit immediately; continuous typing is
 * debounced so undo doesn't step one keystroke at a time.
 *
 * Uses refs rather than state for the stack itself: undo()/redo() need to
 * return the resulting HTML synchronously so the caller can write it
 * straight into the contentEditable element, and a React state updater's
 * callback isn't guaranteed to run within the same tick as the setState
 * call — a plain ref sidesteps that entirely. A tiny reducer forces a
 * re-render so canUndo/canRedo stay accurate for the toolbar buttons.
 */
export function useEditorHistory(initialHtml: string) {
  const entriesRef = React.useRef<string[]>([initialHtml]);
  const indexRef = React.useRef(0);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, forceRender] = React.useReducer((tick: number) => tick + 1, 0);

  const commit = React.useCallback((html: string, options?: { immediate?: boolean }) => {
    const push = () => {
      if (entriesRef.current[indexRef.current] === html) return;
      const truncated = entriesRef.current.slice(0, indexRef.current + 1);
      entriesRef.current = [...truncated, html];
      indexRef.current = entriesRef.current.length - 1;
      forceRender();
    };

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (options?.immediate) {
      push();
    } else {
      debounceRef.current = setTimeout(push, 400);
    }
  }, []);

  const undo = React.useCallback((): string | null => {
    if (indexRef.current === 0) return null;
    indexRef.current -= 1;
    forceRender();
    return entriesRef.current[indexRef.current];
  }, []);

  const redo = React.useCallback((): string | null => {
    if (indexRef.current >= entriesRef.current.length - 1) return null;
    indexRef.current += 1;
    forceRender();
    return entriesRef.current[indexRef.current];
  }, []);

  return {
    commit,
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < entriesRef.current.length - 1,
  };
}
