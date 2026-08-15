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

export function GeneratorWorkspace() {
  const { sequences, createSequence, updateSequence } = useSavedSequences();
  const [currentId, setCurrentId] = React.useState<string | null>(null);

  const current = sequences.find((sequence) => sequence.id === currentId) ?? null;

  const qualityReport = React.useMemo(() => (current ? scoreSequence(toScorableResult(current)) : null), [current]);

  function generateAndSave(input: GeneratorInput) {
    const result = generateSequence(input);
    const report = scoreSequence(result);
    const saved = createSequence({
      name: `${input.businessName} — ${input.targetAudience}`,
      businessName: input.businessName,
      senderName: input.senderName,
      recipientFirstName: input.recipientFirstName,
      industry: input.industry,
      targetAudience: input.targetAudience,
      painPoint: input.painPoint,
      offer: input.offer,
      tone: input.tone,
      emailLength: input.emailLength,
      ctaType: input.ctaType,
      framework: result.framework,
      emails: result.emails,
      score: report.overall,
    });
    setCurrentId(saved.id);
  }

  function handleRegenerate() {
    if (!current) return;
    generateAndSave({
      businessName: current.businessName,
      senderName: current.senderName,
      recipientFirstName: current.recipientFirstName,
      industry: current.industry,
      targetAudience: current.targetAudience,
      painPoint: current.painPoint,
      offer: current.offer,
      tone: current.tone,
      emailLength: current.emailLength,
      ctaType: current.ctaType,
    });
  }

  function handleUpdateEmail(slot: EmailSlot, updates: { subject: string; body: string }) {
    if (!current) return;
    updateSequence(current.id, applyEmailEdit(current, slot, updates));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <GeneratorForm onGenerate={generateAndSave} />
        <GeneratorOutputPanel sequence={current} onRegenerate={handleRegenerate} onUpdateEmail={handleUpdateEmail} />
      </div>
      <QualityScorePanel report={qualityReport} />
    </div>
  );
}
