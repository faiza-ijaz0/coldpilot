"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { ClipboardCopy, Copy, Download, FileCode2, FileText, FileType2, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import type { EmailSlot, SavedSequence, SavedSequenceEmail } from "@/types";
import { frameworkName } from "@/lib/generator/frameworks";
import { getEmailPlainText } from "@/lib/html-utils";
import {
  copyAllEmails,
  copyIndividualEmail,
  exportSequenceAsMarkdown,
  exportSequenceAsPdf,
  exportSequenceAsTxt,
  type ExportableSequence,
} from "@/lib/export";
import { formatEmailAsText } from "@/lib/export/format-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { EmailEditorDialog } from "@/components/email-editor/email-editor-dialog";

interface GeneratorOutputPanelProps {
  sequence: SavedSequence | null;
  onRegenerate: () => void;
  onUpdateEmail: (slot: EmailSlot, updates: { subject: string; body: string }) => void;
}

const emailListVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const emailItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

function toExportableSequence(sequence: SavedSequence): ExportableSequence {
  return {
    title: `${sequence.businessName} — ${sequence.targetAudience}`,
    subtitle: `Built with the ${frameworkName(sequence.framework)} framework`,
    emails: sequence.emails.map((email) => ({
      label: email.label,
      subject: email.subject,
      body: getEmailPlainText(email),
      delayDays: email.delayDays,
    })),
  };
}

async function copyEmail(email: SavedSequenceEmail) {
  const plainText = formatEmailAsText({
    label: email.label,
    subject: email.subject,
    body: getEmailPlainText(email),
    delayDays: email.delayDays,
  });

  try {
    if (email.format === "html" && typeof ClipboardItem !== "undefined") {
      const html = `<p><strong>${email.label} — Day ${email.delayDays}</strong></p><p><strong>Subject:</strong> ${email.subject}</p>${email.body}`;
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" }),
        }),
      ]);
    } else {
      await copyIndividualEmail({
        label: email.label,
        subject: email.subject,
        body: getEmailPlainText(email),
        delayDays: email.delayDays,
      });
    }
    toast("Email copied to clipboard");
  } catch {
    toast("Couldn't copy", { description: "Your browser blocked clipboard access." });
  }
}

export function GeneratorOutputPanel({ sequence, onRegenerate, onUpdateEmail }: GeneratorOutputPanelProps) {
  const [editingSlot, setEditingSlot] = React.useState<EmailSlot | null>(null);
  const editingEmail = sequence?.emails.find((email) => email.slot === editingSlot) ?? null;

  async function handleCopyAll() {
    if (!sequence) return;
    try {
      await copyAllEmails(toExportableSequence(sequence));
      toast("All emails copied to clipboard");
    } catch {
      toast("Couldn't copy", { description: "Your browser blocked clipboard access." });
    }
  }

  function handleExportTxt() {
    if (!sequence) return;
    exportSequenceAsTxt(toExportableSequence(sequence));
    toast("Exported as .txt");
  }

  function handleExportMarkdown() {
    if (!sequence) return;
    exportSequenceAsMarkdown(toExportableSequence(sequence));
    toast("Exported as Markdown");
  }

  async function handleExportPdf() {
    if (!sequence) return;
    try {
      await exportSequenceAsPdf(toExportableSequence(sequence));
      toast("Exported as PDF");
    } catch {
      toast("Couldn't export PDF", { description: "Something went wrong generating the file." });
    }
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div className="flex flex-col gap-1.5">
            <CardTitle>Generated sequence</CardTitle>
            <CardDescription>
              {sequence
                ? `Built with the ${frameworkName(sequence.framework)} framework. Saved automatically.`
                : "Your output will appear here once generated."}
            </CardDescription>
          </div>
          {sequence ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={handleCopyAll}>
                    <ClipboardCopy className="mr-2 h-4 w-4" />
                    Copy all emails
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleExportTxt}>
                    <FileText className="mr-2 h-4 w-4" />
                    Export as .txt
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleExportMarkdown}>
                    <FileCode2 className="mr-2 h-4 w-4" />
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleExportPdf}>
                    <FileType2 className="mr-2 h-4 w-4" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="outline" size="sm" className="gap-1.5" onClick={onRegenerate}>
                <RefreshCw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent>
          {sequence ? (
            <motion.div
              key={sequence.id}
              initial="hidden"
              animate="visible"
              variants={emailListVariants}
              className="flex flex-col gap-4"
            >
              {sequence.emails.map((email) => (
                <motion.div
                  key={email.slot}
                  variants={emailItemVariants}
                  className="hover-lift flex flex-col gap-3 rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {email.label}
                      </p>
                      <Badge variant="secondary">Day {email.delayDays}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        aria-label="Edit email"
                        onClick={() => setEditingSlot(email.slot)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
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
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No sequence yet"
              description="Fill out the form and generate a sequence to preview it here."
            />
          )}
        </CardContent>
      </Card>

      {editingEmail ? (
        <EmailEditorDialog
          open={editingSlot !== null}
          onOpenChange={(open) => {
            if (!open) setEditingSlot(null);
          }}
          emailLabel={editingEmail.label}
          subject={editingEmail.subject}
          body={editingEmail.body}
          format={editingEmail.format}
          onSave={({ subject, body }) => {
            if (editingSlot) onUpdateEmail(editingSlot, { subject, body });
          }}
        />
      ) : null}
    </>
  );
}
