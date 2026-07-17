import type { SequenceStatus } from "@/types";
import { Badge, type BadgeProps } from "@/components/ui/badge";

const statusConfig: Record<SequenceStatus, { label: string; variant: BadgeProps["variant"] }> = {
  active: { label: "Active", variant: "success" },
  draft: { label: "Draft", variant: "secondary" },
  archived: { label: "Archived", variant: "outline" },
};

interface SequenceStatusBadgeProps {
  status: SequenceStatus;
}

export function SequenceStatusBadge({ status }: SequenceStatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
