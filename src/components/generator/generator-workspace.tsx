"use client";

import * as React from "react";

import type { EmailSlot, GeneratorInput } from "@/types";
import { generateSequence } from "@/lib/generator/engine";
import { scoreSequence } from "@/lib/quality-score/score-engine";
import { applyEmailEdit, toScorableResult } from "@/lib/quality-score/adapters";
import { useSavedSequences } from "@/hooks/use-saved-sequences";
import { GeneratorForm } from "@/components/generator/generator-form";
import { GeneratorOutputPanel } from "@/components/generator/generator-output-panel";
import { QualityScorePanel } from "@/components/generator/quality-score-panel";

/** The persisted fields a fresh generation touches — shared by Generate (new record) and Regenerate (same record, new content). */
function toGeneratedFields(input: GeneratorInput) {
  const result = generateSequence(input);
  const report = scoreSequence(result);
  return {
    framework: result.framework,
    emails: result.emails,
    score: report.overall,
    tone: input.tone,
    emailLength: input.emailLength,
    ctaType: input.ctaType,
  };
}

function toGeneratorInput(sequence: {
  businessName: string;
  senderName: string;
  recipientFirstName?: string;
  industry: GeneratorInput["industry"];
  targetAudience: string;
  painPoint: string;
  offer: string;
  tone: GeneratorInput["tone"];
  emailLength: GeneratorInput["emailLength"];
  ctaType: GeneratorInput["ctaType"];
}): GeneratorInput {
  return {
    businessName: sequence.businessName,
    senderName: sequence.senderName,
    recipientFirstName: sequence.recipientFirstName,
    industry: sequence.industry,
    targetAudience: sequence.targetAudience,
    painPoint: sequence.painPoint,
    offer: sequence.offer,
    tone: sequence.tone,
    emailLength: sequence.emailLength,
    ctaType: sequence.ctaType,
  };
}

export function GeneratorWorkspace() {
  const { sequences, createSequence, updateSequence, duplicateSequence } = useSavedSequences();
  const [currentId, setCurrentId] = React.useState<string | null>(null);

  const current = sequences.find((sequence) => sequence.id === currentId) ?? null;

  const qualityReport = React.useMemo(() => (current ? scoreSequence(toScorableResult(current)) : null), [current]);

  /** Initial Generate — always creates a brand-new saved record and makes it the active one. */
  function handleGenerate(input: GeneratorInput) {
    const generated = toGeneratedFields(input);
    const saved = createSequence({
      name: `${input.businessName} — ${input.targetAudience}`,
      businessName: input.businessName,
      senderName: input.senderName,
      recipientFirstName: input.recipientFirstName,
      industry: input.industry,
      targetAudience: input.targetAudience,
      painPoint: input.painPoint,
      offer: input.offer,
      ...generated,
    });
    setCurrentId(saved.id);
  }

  /** Regenerate — re-rolls content for the *same* active record: same id/createdAt, fresh emails/score/framework/updatedAt. Never creates a new saved sequence. */
  function handleRegenerate() {
    if (!current) return;
    const generated = toGeneratedFields(toGeneratorInput(current));
    updateSequence(current.id, generated);
  }

  /** Save as New — explicitly clones the active sequence (current content, including any regenerations) into its own record and switches to editing that copy. */
  function handleSaveAsNew() {
    if (!current) return;
    const saved = duplicateSequence(current.id);
    if (saved) setCurrentId(saved.id);
  }

  function handleUpdateEmail(slot: EmailSlot, updates: { subject: string; body: string }) {
    if (!current) return;
    updateSequence(current.id, applyEmailEdit(current, slot, updates));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <GeneratorForm onGenerate={handleGenerate} />
        <GeneratorOutputPanel
          sequence={current}
          onRegenerate={handleRegenerate}
          onSaveAsNew={handleSaveAsNew}
          onUpdateEmail={handleUpdateEmail}
        />
      </div>
      <QualityScorePanel report={qualityReport} />
    </div>
  );
}
