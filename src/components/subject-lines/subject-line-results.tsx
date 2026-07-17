"use client";

import { motion, type Variants } from "framer-motion";
import { Copy, RefreshCw, Type } from "lucide-react";
import { toast } from "sonner";

import type { SubjectLineResult } from "@/types";
import { subjectLineCategories } from "@/lib/subject-lines/categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

interface SubjectLineResultsProps {
  result: SubjectLineResult | null;
  onRegenerate: () => void;
}

const groupListVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const groupItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

async function copySubjectLine(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied to clipboard");
  } catch {
    toast("Couldn't copy", { description: "Your browser blocked clipboard access." });
  }
}

export function SubjectLineResults({ result, onRegenerate }: SubjectLineResultsProps) {

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Generated subject lines</CardTitle>
          <CardDescription>
            {result
              ? `${result.subjectLines.length} subject lines across ${subjectLineCategories.length} angles.`
              : "Your subject lines will appear here once generated."}
          </CardDescription>
        </div>
        {result ? (
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={onRegenerate}>
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {result ? (
          <motion.div
            key={result.id}
            initial="hidden"
            animate="visible"
            variants={groupListVariants}
            className="flex flex-col gap-5"
          >
            {subjectLineCategories.map((category) => {
              const lines = result.subjectLines.filter((line) => line.category === category.value);
              if (lines.length === 0) return null;

              return (
                <motion.div key={category.value} variants={groupItemVariants} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{category.label}</Badge>
                    <span className="text-xs text-muted-foreground">{category.description}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {lines.map((line) => (
                      <div
                        key={line.id}
                        className="hover-lift flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 hover:border-primary/40"
                      >
                        <span className="text-sm">{line.text}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                          aria-label="Copy subject line"
                          onClick={() => copySubjectLine(line.text)}
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <EmptyState
            icon={Type}
            title="No subject lines yet"
            description="Fill out the form and generate to see subject lines across five proven angles."
          />
        )}
      </CardContent>
    </Card>
  );
}
