interface EmailPreviewProps {
  subject: string;
  bodyHtml: string;
}

export function EmailPreview({ subject, bodyHtml }: EmailPreviewProps) {
  return (
    <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-1 border-b border-border pb-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Subject</span>
        <p className="font-medium">
          {subject.trim() ? subject : <span className="text-muted-foreground">(no subject)</span>}
        </p>
      </div>
      <div
        className="min-h-[180px] text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
        dangerouslySetInnerHTML={{
          __html: bodyHtml.trim() ? bodyHtml : "<p class='text-muted-foreground'>Nothing to preview yet.</p>",
        }}
      />
    </div>
  );
}
