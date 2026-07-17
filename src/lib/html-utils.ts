import type { EmailBodyFormat } from "@/types";

/** Strips tags and decodes common entities, turning block-level breaks into newlines. */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Converts plain, \n\n-separated text into `<p>` blocks for the rich text editor to open. */
export function plainTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** The analyzable plain text for an email, regardless of whether it's been rich-text edited. */
export function getEmailPlainText(email: { body: string; format: EmailBodyFormat }): string {
  return email.format === "html" ? stripHtmlTags(email.body) : email.body;
}
