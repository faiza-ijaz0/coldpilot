// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EmailBodyEditor } from "@/components/email-editor/email-body-editor";

function makeClipboardData(entries: Record<string, string>) {
  return {
    getData: (format: string) => entries[format] ?? "",
  } as unknown as DataTransfer;
}

// jsdom doesn't implement document.execCommand at all, and the editor is
// built entirely on it (matching the toolbar-button architecture this task
// explicitly says not to rewrite). Rather than reimplementing browser
// rich-text editing, these tests verify the actual security contract:
// the paste handler sanitizes *before* ever attempting an insertion, and
// an unsafe link never reaches execCommand in the first place — both
// observable without execCommand doing real DOM work.
let execCommandSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  execCommandSpy = vi.fn();
  document.execCommand = execCommandSpy as unknown as typeof document.execCommand;
});

afterEach(() => {
  cleanup();
});

describe("EmailBodyEditor", () => {
  it("mounts sanitized initial HTML into the editable region", () => {
    const onChange = vi.fn();
    render(<EmailBodyEditor initialHtml='<p onclick="alert(1)">Hi</p><script>alert(1)</script>' onChange={onChange} />);

    const editor = document.querySelector("[contenteditable]") as HTMLElement;
    expect(editor.innerHTML).not.toMatch(/onclick/i);
    expect(editor.innerHTML).not.toMatch(/<script/i);
    expect(editor.textContent).toContain("Hi");
  });

  it("renders safe initial HTML (paragraphs, bold, links) as-is", () => {
    const onChange = vi.fn();
    render(
      <EmailBodyEditor
        initialHtml='<p>Hello <strong>John</strong></p><a href="https://example.com">details</a>'
        onChange={onChange}
      />
    );

    expect(screen.getByText("John")).toBeTruthy();
    expect(screen.getByRole("link", { name: "details" }).getAttribute("href")).toBe("https://example.com");
  });

  it("sanitizes pasted HTML before attempting to insert it", () => {
    const onChange = vi.fn();
    render(<EmailBodyEditor initialHtml="<p>Start</p>" onChange={onChange} />);

    const editor = document.querySelector("[contenteditable]") as HTMLElement;
    const pasteEvent = new Event("paste", { bubbles: true, cancelable: true }) as unknown as ClipboardEvent;
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: makeClipboardData({
        "text/html": '<p onclick="steal()">Pasted</p><img src=x onerror="steal()"><script>steal()</script>',
      }),
    });

    fireEvent(editor, pasteEvent);

    expect(execCommandSpy).toHaveBeenCalledTimes(1);
    const [command, , insertedHtml] = execCommandSpy.mock.calls[0] as [string, boolean, string];
    expect(command).toBe("insertHTML");
    expect(insertedHtml).not.toMatch(/onclick|onerror|<script|<img/i);
    expect(insertedHtml).toContain("Pasted");
  });

  it("inserts plain text paste without invoking the HTML path", () => {
    render(<EmailBodyEditor initialHtml="<p>Start</p>" onChange={vi.fn()} />);

    const editor = document.querySelector("[contenteditable]") as HTMLElement;
    const pasteEvent = new Event("paste", { bubbles: true, cancelable: true }) as unknown as ClipboardEvent;
    Object.defineProperty(pasteEvent, "clipboardData", {
      value: makeClipboardData({ "text/plain": "just plain text" }),
    });

    fireEvent(editor, pasteEvent);

    expect(execCommandSpy).toHaveBeenCalledWith("insertText", false, "just plain text");
  });

  it("blocks a javascript: URL from ever reaching link creation", () => {
    render(<EmailBodyEditor initialHtml="<p>Some text</p>" onChange={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("Insert link"));
    fireEvent.change(screen.getByPlaceholderText("https://..."), { target: { value: "javascript:alert(1)" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(execCommandSpy).not.toHaveBeenCalledWith("createLink", expect.anything(), expect.anything());
  });

  it("blocks a data: URL from ever reaching link creation", () => {
    render(<EmailBodyEditor initialHtml="<p>Some text</p>" onChange={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("Insert link"));
    fireEvent.change(screen.getByPlaceholderText("https://..."), {
      target: { value: "data:text/html,<script>alert(1)</script>" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(execCommandSpy).not.toHaveBeenCalledWith("createLink", expect.anything(), expect.anything());
  });

  it("allows a safe https URL to reach link creation", () => {
    render(<EmailBodyEditor initialHtml="<p>Some text</p>" onChange={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("Insert link"));
    fireEvent.change(screen.getByPlaceholderText("https://..."), { target: { value: "https://example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(execCommandSpy).toHaveBeenCalledWith("createLink", false, "https://example.com");
  });
});
