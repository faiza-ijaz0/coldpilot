"use client";

import * as React from "react";

import type { SubjectLineInput, SubjectLineResult } from "@/types";
import { generateSubjectLines } from "@/lib/subject-lines/engine";
import { SubjectLineForm } from "@/components/subject-lines/subject-line-form";
import { SubjectLineResults } from "@/components/subject-lines/subject-line-results";

export function SubjectLineWorkspace() {
  const [result, setResult] = React.useState<SubjectLineResult | null>(null);

  function handleGenerate(input: SubjectLineInput) {
    setResult(generateSubjectLines(input));
  }

  function handleRegenerate() {
    if (!result) return;
    setResult(generateSubjectLines(result.input));
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <SubjectLineForm onGenerate={handleGenerate} />
      <SubjectLineResults result={result} onRegenerate={handleRegenerate} />
    </div>
  );
}
