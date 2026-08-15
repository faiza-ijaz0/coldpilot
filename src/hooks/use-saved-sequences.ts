"use client";

import * as React from "react";

import type { NewSequenceInput, SavedSequence } from "@/types";
import { useLocalStorageState } from "@/hooks/use-local-storage";
import {
  buildSequenceRecord,
  cloneSequenceRecord,
  GENERATED_COUNT_STORAGE_KEY,
  normalizeSavedSequence,
  SEQUENCES_STORAGE_KEY,
} from "@/lib/storage/sequences";

const RECENT_LIMIT = 5;

/**
 * The single source of truth for generated sequences — every page
 * (Generator, Saved Sequences, Analytics) reads and writes through this
 * hook, so a change made on one page is immediately visible on the next
 * (fresh mount reads current localStorage) with no separate sync layer.
 */
export function useSavedSequences() {
  const [rawSequences, setSequences] = useLocalStorageState<SavedSequence[]>(SEQUENCES_STORAGE_KEY, []);
  // Cumulative — never decrements, even when a sequence is later deleted, so
  // it answers "how many have I ever generated" distinctly from the live count.
  const [totalGenerated, setTotalGenerated] = useLocalStorageState<number>(GENERATED_COUNT_STORAGE_KEY, 0);

  // Normalized on every read so records saved before a field (e.g. senderName)
  // existed never crash newer code that assumes it's present.
  const sequences = React.useMemo(() => rawSequences.map(normalizeSavedSequence), [rawSequences]);

  const createSequence = React.useCallback(
    (input: NewSequenceInput) => {
      const sequence = buildSequenceRecord(input);
      setSequences((prev) => [sequence, ...prev]);
      setTotalGenerated((prev) => prev + 1);
      return sequence;
    },
    [setSequences, setTotalGenerated]
  );

  const updateSequence = React.useCallback(
    (id: string, patch: Partial<Omit<SavedSequence, "id" | "createdAt">>) => {
      setSequences((prev) =>
        prev.map((sequence) =>
          sequence.id === id ? { ...sequence, ...patch, updatedAt: new Date().toISOString() } : sequence
        )
      );
    },
    [setSequences]
  );

  const deleteSequence = React.useCallback(
    (id: string) => {
      setSequences((prev) => prev.filter((sequence) => sequence.id !== id));
    },
    [setSequences]
  );

  const duplicateSequence = React.useCallback(
    (id: string): SavedSequence | null => {
      const original = rawSequences.find((sequence) => sequence.id === id);
      if (!original) return null;
      const cloned = cloneSequenceRecord(original);
      setSequences((prev) => [cloned, ...prev]);
      return cloned;
    },
    [rawSequences, setSequences]
  );

  const renameSequence = React.useCallback(
    (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateSequence(id, { name: trimmed });
    },
    [updateSequence]
  );

  const recentSequences = React.useMemo(
    () =>
      [...sequences]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, RECENT_LIMIT),
    [sequences]
  );

  return {
    sequences,
    recentSequences,
    totalGenerated,
    createSequence,
    updateSequence,
    deleteSequence,
    duplicateSequence,
    renameSequence,
  };
}
