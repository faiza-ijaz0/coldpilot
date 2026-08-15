import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const CALL_SITES = [
  "src/components/generator/generator-output-panel.tsx",
  "src/components/sequences/sequence-card.tsx",
];

/**
 * Guards against the exact bug this module fixes: a component quietly
 * reintroducing its own `toExportableSequence` instead of importing the
 * canonical one, which is how the two implementations diverged in the
 * first place.
 */
describe("export entry points use the centralized transformation", () => {
  it.each(CALL_SITES)("%s imports toExportableSequence from @/lib/export and defines no local copy", (relativePath) => {
    const source = readFileSync(resolve(process.cwd(), relativePath), "utf-8");

    expect(source).toMatch(/import\s*\{[^}]*\btoExportableSequence\b[^}]*\}\s*from\s*["']@\/lib\/export["']/);
    expect(source).not.toMatch(/function\s+toExportableSequence\s*\(/);
  });
});
