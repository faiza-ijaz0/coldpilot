"use client";

import * as React from "react";
import {
  ClipboardCopy,
  Eye,
  FileCode2,
  FileText,
  FileType2,
  Mail,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

import type { EmailSlot, SavedSequence } from "@/types";
import { getNicheConfig } from "@/lib/personalization/engine";
import { toneOptions } from "@/lib/generator/tone-options";
import { copyAllEmails, exportSequenceAsMarkdown, exportSequenceAsPdf, exportSequenceAsTxt, toExportableSequence } from "@/lib/export";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SequenceNameDialog } from "@/components/sequences/sequence-name-dialog";
import { DeleteSequenceDialog } from "@/components/sequences/delete-sequence-dialog";
import { SequenceDetailDialog } from "@/components/sequences/sequence-detail-dialog";

interface SequenceCardProps {
  sequence: SavedSequence;
  onRename: (id: string, name: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateEmail: (id: string, slot: EmailSlot, updates: { subject: string; body: string }) => void;
}

function toneLabel(value: SavedSequence["tone"]): string {
  return toneOptions.find((tone) => tone.value === value)?.label ?? value;
}

function scoreTextClass(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-destructive";
}

export function SequenceCard({ sequence, onRename, onDuplicate, onDelete, onUpdateEmail }: SequenceCardProps) {
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [viewOpen, setViewOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const createdAt = new Date(sequence.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  async function handleCopySequence() {
    try {
      await copyAllEmails(toExportableSequence(sequence));
      toast("Sequence copied to clipboard");
    } catch {
      toast("Couldn't copy", { description: "Your browser blocked clipboard access." });
    }
  }

  function handleExportTxt() {
    exportSequenceAsTxt(toExportableSequence(sequence));
    toast("Exported as .txt");
  }

  function handleExportMarkdown() {
    exportSequenceAsMarkdown(toExportableSequence(sequence));
    toast("Exported as Markdown");
  }

  async function handleExportPdf() {
    try {
      await exportSequenceAsPdf(toExportableSequence(sequence));
      toast("Exported as PDF");
    } catch {
      toast("Couldn't export PDF", { description: "Something went wrong generating the file." });
    }
  }

  return (
    <>
      <Card className="hover-lift hover:border-primary/50">
        <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <span className="truncate font-semibold">{sequence.businessName}</span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Sequence actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setViewOpen(true)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setRenameOpen(true)}>Rename</DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  onDuplicate(sequence.id);
                  toast("Sequence duplicated");
                }}
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCopySequence}>
                <ClipboardCopy className="mr-2 h-4 w-4" />
                Copy sequence
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
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
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onSelect={() => setDeleteOpen(true)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Industry</span>
              <span className="truncate">{getNicheConfig(sequence.industry).label}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Tone</span>
              <span className="truncate">{toneLabel(sequence.tone)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={cn("text-sm font-semibold", scoreTextClass(sequence.score))}>
              {sequence.score}/100
            </span>
            <span className="text-xs text-muted-foreground">Created {createdAt}</span>
          </div>
        </CardContent>
      </Card>

      <SequenceNameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename sequence"
        description="Give this sequence a new name."
        initialName={sequence.name}
        confirmLabel="Rename"
        onConfirm={(name) => {
          onRename(sequence.id, name);
          toast("Sequence renamed");
        }}
      />

      <DeleteSequenceDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        sequenceName={sequence.name}
        onConfirm={() => {
          onDelete(sequence.id);
          toast("Sequence deleted");
        }}
      />

      {viewOpen ? (
        <SequenceDetailDialog open={viewOpen} onOpenChange={setViewOpen} sequence={sequence} editable={false} />
      ) : null}

      {editOpen ? (
        <SequenceDetailDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          sequence={sequence}
          editable
          onUpdateEmail={(slot, updates) => onUpdateEmail(sequence.id, slot, updates)}
        />
      ) : null}
    </>
  );
}
