import type { EmailSlot } from "@/types";

export const subjectBank: Record<EmailSlot, string[]> = {
  introduction: [
    "quick question about {{targetAudience}} + {{painPoint}}",
    "{{painPoint}} — worth 2 minutes?",
    "idea for {{company}}",
    "how {{industry}} teams are handling {{painPoint}}",
    "{{businessName}} <> {{company}}",
  ],
  "follow-up": [
    "re: {{painPoint}}",
    "following up — {{offer}}",
    "circling back on this",
    "another angle on {{painPoint}}",
    "worth a second look?",
  ],
  "final-follow-up": [
    "last note from me",
    "should I close the loop here?",
    "one more try — then I'll stop",
    "still worth exploring, or not the right time?",
  ],
};
