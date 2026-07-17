import type { ExportableSequence } from "@/lib/export/types";
import { dayLabel } from "@/lib/export/day-label";

const MARGIN_X = 56;
const MARGIN_BOTTOM = 56;
const ACCENT_RGB: [number, number, number] = [99, 91, 255];

export async function buildSequencePdf(sequence: ExportableSequence) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGIN_X * 2;
  let y = 64;

  function ensureSpace(height: number) {
    if (y + height > pageHeight - MARGIN_BOTTOM) {
      doc.addPage();
      y = 64;
    }
  }

  function writeParagraphLines(text: string, fontSize: number, lineHeight: number) {
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      ensureSpace(lineHeight);
      doc.text(line, MARGIN_X, y);
      y += lineHeight;
    });
  }

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(25, 25, 25);
  writeParagraphLines(sequence.title, 20, 24);

  if (sequence.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 120);
    writeParagraphLines(sequence.subtitle, 11, 16);
  }

  y += 8;
  doc.setDrawColor(224, 224, 224);
  doc.line(MARGIN_X, y, pageWidth - MARGIN_X, y);
  y += 30;

  sequence.emails.forEach((email, index) => {
    ensureSpace(60);

    doc.setFillColor(...ACCENT_RGB);
    doc.rect(MARGIN_X, y - 11, 4, 14, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(25, 25, 25);
    doc.text(email.label.toUpperCase(), MARGIN_X + 12, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(140, 140, 140);
    doc.text(dayLabel(email.delayDays), pageWidth - MARGIN_X, y, { align: "right" });

    y += 24;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20, 20, 20);
    writeParagraphLines(`Subject: ${email.subject}`, 12, 16);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(65, 65, 65);
    email.body.split(/\n{2,}/).forEach((paragraph) => {
      writeParagraphLines(paragraph, 10.5, 15);
      y += 8;
    });

    y += 10;
    if (index < sequence.emails.length - 1) {
      ensureSpace(24);
      doc.setDrawColor(232, 232, 232);
      doc.line(MARGIN_X, y, pageWidth - MARGIN_X, y);
      y += 28;
    }
  });

  return doc;
}
