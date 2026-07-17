"use client";

import * as React from "react";
import { toast } from "sonner";

import type { EmailBodyFormat } from "@/types";
import { plainTextToHtml } from "@/lib/html-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmailBodyEditor } from "@/components/email-editor/email-body-editor";
import { EmailPreview } from "@/components/email-editor/email-preview";

interface EmailEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emailLabel: string;
  subject: string;
  body: string;
  format: EmailBodyFormat;
  onSave: (next: { subject: string; body: string }) => void;
}

export function EmailEditorDialog({
  open,
  onOpenChange,
  emailLabel,
  subject,
  body,
  format,
  onSave,
}: EmailEditorDialogProps) {
  const [subjectValue, setSubjectValue] = React.useState(subject);
  const [bodyHtml, setBodyHtml] = React.useState(() => (format === "html" ? body : plainTextToHtml(body)));
  const [editorKey, setEditorKey] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    setSubjectValue(subject);
    setBodyHtml(format === "html" ? body : plainTextToHtml(body));
    setEditorKey((prev) => prev + 1);
    // Reset only when a (possibly different) email is opened, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSave() {
    onSave({ subject: subjectValue, body: bodyHtml });
    toast("Email updated");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {emailLabel}</DialogTitle>
          <DialogDescription>
            Format the body, see a live preview, and save when you&apos;re happy with it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Label htmlFor="edit-subject">Subject</Label>
          <Input
            id="edit-subject"
            value={subjectValue}
            onChange={(event) => setSubjectValue(event.target.value)}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>Edit</Label>
            <EmailBodyEditor key={editorKey} initialHtml={bodyHtml} onChange={setBodyHtml} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Live preview</Label>
            <EmailPreview subject={subjectValue} bodyHtml={bodyHtml} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
