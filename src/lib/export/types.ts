export interface ExportableEmail {
  label: string;
  subject: string;
  body: string;
  delayDays: number;
}

export interface ExportableSequence {
  title: string;
  subtitle?: string;
  emails: ExportableEmail[];
}
