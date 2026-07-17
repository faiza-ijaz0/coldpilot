"use client";

import * as React from "react";
import { Copy, Pencil } from "lucide-react";
import { toast } from "sonner";

import type { EmailSlot, SavedSequence, SavedSequenceEmail } from "@/types";
import { frameworkName } from "@/lib/generator/frameworks";
import { getNicheConfig } from "@/lib/personalization/engine";
import { toneOptions } from "@/lib/generator/tone-options";
import { getEmailPlainText } from "@/lib/html-utils";
import { formatEmailAsText } from "@/lib/export/format-text";
import { scoreSequence } from "@/lib/quality-score/score-engine";
import { toScorableResult } from "@/lib/quality-score/adapters";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmailEditorDialog } from "@/components/email-editor/email-editor-dialog";

interface SequenceDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequence: SavedSequence;
  editable: boolean;
  onUpdateEmail?: (slot: EmailSlot, updates: { subject: string; body: string }) => void;
}

function toneLabel(value: SavedSequence["tone"]): string {
  return toneOptions.find((tone) => tone.value === value)?.label ?? value;
}

async function copyEmail(email: SavedSequenceEmail) {
  const plainText = formatEmailAsText({
    label: email.label,
    subject: email.subject,
    body: getEmailPlainText(email),
    delayDays: email.delayDays,
  });
  try {
    await navigator.clipboard.writeText(plainText);
    toast("Email copied to clipboard");
  } catch {
    toast("Couldn't copy", { description: "Your browser blocked clipboard access." });
  }
}

export function SequenceDetailDialog({
  open,
  onOpenChange,
  sequence,
  editable,
  onUpdateEmail,
}: SequenceDetailDialogProps) {
  const [editingSlot, setEditingSlot] = React.useState<EmailSlot | null>(null);
  const editingEmail = sequence.emails.find((email) => email.slot === editingSlot) ?? null;

  const report = React.useMemo(() => scoreSequence(toScorableResult(sequence)), [sequence]);
  const industryLabel = getNicheConfig(sequence.industry).label;
  const createdAt = new Date(sequence.createdAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{sequence.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border p-4 text-sm sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Business</span>
              <span className="truncate font-medium">{sequence.businessName}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Industry</span>
              <span className="truncate font-medium">{industryLabel}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Tone</span>
              <span className="truncate font-medium">{toneLabel(sequence.tone)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Score</span>
              <span
                className={cn(
                  "font-medium",
                  report.overall >= 80
                    ? "text-success"
                    : report.overall >= 60
                      ? "text-warning"
                      : "text-destructive"
                )}
              >
                {report.overall}/100
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Built with the {frameworkName(sequence.framework)} framework · Generated {createdAt}
          </p>

          <div className="flex flex-col gap-4">
            {sequence.emails.map((email) => (
              <div key={email.slot} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {email.label}
                    </p>
                    <Badge variant="secondary">Day {email.delayDays}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {editable ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        aria-label="Edit email"
                        onClick={() => setEditingSlot(email.slot)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      aria-label="Copy email"
                      onClick={() => copyEmail(email)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="font-medium">{email.subject}</p>
                {email.format === "html" ? (
                  <div
                    className="text-sm text-muted-foreground [&_a]:text-primary [&_a]:underline [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                    dangerouslySetInnerHTML={{ __html: email.body }}
                  />
                ) : (
                  <p className="whitespace-pre-line text-sm text-muted-foreground">{email.body}</p>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {editable && editingEmail ? (
        <EmailEditorDialog
          open={editingSlot !== null}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setEditingSlot(null);
          }}
          emailLabel={editingEmail.label}
          subject={editingEmail.subject}
          body={editingEmail.body}
          format={editingEmail.format}
          onSave={({ subject, body }) => {
            if (editingSlot) onUpdateEmail?.(editingSlot, { subject, body });
          }}
        />
      ) : null}
    </>
  );
}
