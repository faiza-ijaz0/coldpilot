"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteSequenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequenceName: string;
  onConfirm: () => void;
}

export function DeleteSequenceDialog({ open, onOpenChange, sequenceName, onConfirm }: DeleteSequenceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &quot;{sequenceName}&quot;?</DialogTitle>
          <DialogDescription>
            This can&apos;t be undone — the sequence will be removed from this browser.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
