"use client";

import * as React from "react";

import { readFromStorage, writeToStorage } from "@/lib/storage/local-storage";

/**
 * SSR-safe localStorage-backed state. Renders `initialValue` on the server
 * and first client pass, then hydrates from storage after mount to avoid
 * a hydration mismatch.
 *
 * `hydrated` is state, not a ref, on purpose: it must only gate the write
 * effect once a render has actually committed with the hydrated data. A
 * ref flips synchronously within the same effect-flush as the hydration
 * read, so under React's dev-mode double-invoke of effects, the write
 * effect could fire with the pre-hydration closure of `state` while the
 * ref already reads true — silently overwriting real stored data with the
 * initial empty value. State can't do that: it only becomes visible on a
 * render where `state` has already been updated too.
 */
export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [state, setState] = React.useState<T>(initialValue);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setState(readFromStorage(key, initialValue));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  React.useEffect(() => {
    if (!hydrated) return;
    writeToStorage(key, state);
  }, [key, state, hydrated]);

  return [state, setState] as const;
}
