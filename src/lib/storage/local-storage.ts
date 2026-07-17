/**
 * Central localStorage primitives. Every persisted feature in this app reads
 * and writes through these two functions — no component or hook talks to
 * `window.localStorage` directly. Both are SSR-safe (no-op with a fallback
 * on the server) and swallow corrupted/missing data rather than throwing.
 */

export function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode, quota exceeded, etc.) — fail silently
  }
}
