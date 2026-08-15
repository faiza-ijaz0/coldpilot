"use client";

import * as React from "react";
import { Bold, Eraser, Italic, Link2, List, ListOrdered, Redo2, Underline, Undo2 } from "lucide-react";

import { stripHtmlTags } from "@/lib/html-utils";
import { sanitizeEmailHtml } from "@/lib/security/sanitize-html";
import { isSafeUrl } from "@/lib/security/safe-url";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorHistory } from "@/components/email-editor/use-editor-history";
import { moveCursorToEnd, normalizeEditorHtml } from "@/components/email-editor/normalize-html";

interface EmailBodyEditorProps {
  initialHtml: string;
  onChange: (html: string) => void;
}

const TOOLBAR_BUTTONS = [
  { command: "bold", icon: Bold, label: "Bold" },
  { command: "italic", icon: Italic, label: "Italic" },
  { command: "underline", icon: Underline, label: "Underline" },
  { command: "insertUnorderedList", icon: List, label: "Bulleted list" },
  { command: "insertOrderedList", icon: ListOrdered, label: "Numbered list" },
] as const;

export function EmailBodyEditor({ initialHtml, onChange }: EmailBodyEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const { commit, undo, redo, canUndo, canRedo } = useEditorHistory(initialHtml);
  const [linkBarOpen, setLinkBarOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [activeCommands, setActiveCommands] = React.useState<Set<string>>(new Set());
  const [plainText, setPlainText] = React.useState(() => stripHtmlTags(initialHtml));

  React.useEffect(() => {
    // Sanitized even though callers should already be passing clean HTML —
    // the editor shouldn't trust its own input boundary any more than a
    // paste event, since this is what mounts a legacy saved sequence's HTML
    // straight into a live contentEditable DOM.
    if (editorRef.current) editorRef.current.innerHTML = sanitizeEmailHtml(initialHtml);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function syncPlainText() {
    setPlainText(stripHtmlTags(editorRef.current?.innerHTML ?? ""));
  }

  function refreshActiveCommands() {
    const next = new Set<string>();
    for (const { command } of TOOLBAR_BUTTONS) {
      try {
        if (document.queryCommandState(command)) next.add(command);
      } catch {
        // command state unsupported in this browser — leave inactive
      }
    }
    setActiveCommands(next);
  }

  function handleInput() {
    const html = editorRef.current?.innerHTML ?? "";
    onChange(html);
    syncPlainText();
    commit(html);
  }

  function runCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);

    const editor = editorRef.current;
    if (editor) {
      const normalized = normalizeEditorHtml(editor.innerHTML);
      if (normalized !== editor.innerHTML) {
        editor.innerHTML = normalized;
        moveCursorToEnd(editor);
      }
    }

    const html = editorRef.current?.innerHTML ?? "";
    onChange(html);
    syncPlainText();
    commit(html, { immediate: true });
    refreshActiveCommands();
  }

  function applyHistoryValue(html: string | null) {
    if (html === null || !editorRef.current) return;
    editorRef.current.innerHTML = html;
    onChange(html);
    syncPlainText();
  }

  /**
   * Pasted content is the one place genuinely untrusted HTML can enter the
   * editor (typing and toolbar formatting only ever produce browser-native
   * b/i/u/ul/ol/li/a tags). Sanitize before it ever touches the live DOM,
   * rather than letting the browser insert it natively and cleaning up
   * after — plain-text paste (no HTML on the clipboard) is untouched.
   */
  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");

    if (html) {
      document.execCommand("insertHTML", false, sanitizeEmailHtml(html));
    } else if (text) {
      document.execCommand("insertText", false, text);
    }

    const editor = editorRef.current;
    if (editor) {
      const normalized = normalizeEditorHtml(editor.innerHTML);
      if (normalized !== editor.innerHTML) {
        editor.innerHTML = normalized;
        moveCursorToEnd(editor);
      }
    }

    handleInput();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = event.key.toLowerCase();
    if (key === "z" && event.shiftKey) {
      event.preventDefault();
      applyHistoryValue(redo());
    } else if (key === "z") {
      event.preventDefault();
      applyHistoryValue(undo());
    } else if (key === "y") {
      event.preventDefault();
      applyHistoryValue(redo());
    }
  }

  function applyLink() {
    const trimmedUrl = linkUrl.trim();
    // Only http:, https:, and mailto: are ever allowed — anything else
    // (javascript:, data:, vbscript:, malformed input) is rejected outright
    // rather than merely checked for being non-empty.
    if (!isSafeUrl(trimmedUrl)) return;
    runCommand("createLink", trimmedUrl);
    setLinkUrl("");
    setLinkBarOpen(false);
  }

  const trimmed = plainText.trim();
  const wordCount = trimmed.length ? trimmed.split(/\s+/).length : 0;
  const charCount = plainText.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {TOOLBAR_BUTTONS.map(({ command, icon: Icon, label }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", activeCommands.has(command) && "bg-accent text-accent-foreground")}
            aria-label={label}
            aria-pressed={activeCommands.has(command)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command)}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", linkBarOpen && "bg-accent text-accent-foreground")}
          aria-label="Insert link"
          aria-pressed={linkBarOpen}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setLinkBarOpen((prev) => !prev)}
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Clear formatting"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("removeFormat")}
        >
          <Eraser className="h-4 w-4" />
        </Button>

        <div className="mx-1 h-5 w-px bg-border" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Undo"
          disabled={!canUndo}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyHistoryValue(undo())}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Redo"
          disabled={!canRedo}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => applyHistoryValue(redo())}
        >
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {linkBarOpen ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="https://..."
            value={linkUrl}
            onChange={(event) => setLinkUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
            }}
            className="h-8"
          />
          <Button type="button" size="sm" onClick={applyLink}>
            Apply
          </Button>
        </div>
      ) : null}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyUp={refreshActiveCommands}
        onMouseUp={refreshActiveCommands}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-h-[240px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          "[&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline"
        )}
      />

      <div className="flex items-center justify-end gap-4 text-xs text-muted-foreground">
        <span>{wordCount} words</span>
        <span>{charCount} characters</span>
      </div>
    </div>
  );
}
