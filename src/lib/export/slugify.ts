export function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return slug || "sequence";
}
