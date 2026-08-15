export interface ExportableEmail {
  label: string;
  subject: string;
  body: string;
  delayDays: number;
}

/**
 * The canonical shape every export format (PDF, text, markdown, clipboard)
 * renders from. Produced only by `toExportableSequence` — see
 * `to-exportable-sequence.ts` for the single source of truth on how a
 * `SavedSequence` maps to this.
 */
export interface ExportableSequence {
  title: string;
  subtitle?: string;
  businessName: string;
  targetAudience: string;
  niche: string;
  tone: string;
  framework: string;
  senderName: string;
  recipientFirstName?: string;
  emails: ExportableEmail[];
}
