export function dayLabel(delayDays: number): string {
  return delayDays === 0 ? "Send immediately" : `Send on day ${delayDays}`;
}
