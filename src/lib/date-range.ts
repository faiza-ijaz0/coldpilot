export function isWithinLastDays(iso: string, days: number): boolean {
  const elapsedMs = Date.now() - new Date(iso).getTime();
  return elapsedMs >= 0 && elapsedMs <= days * 24 * 60 * 60 * 1000;
}
