import { AlertCircle, AlertTriangle, Gauge, Info, ShieldCheck, Sparkles } from "lucide-react";

import type { QualityRecommendation, QualityScoreReport, QualityStrength, RecommendationSeverity } from "@/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";

interface QualityScorePanelProps {
  report: QualityScoreReport | null;
}

function scoreTone(score: number): { label: string; textClass: string } {
  if (score >= 80) return { label: "Strong", textClass: "text-success" };
  if (score >= 60) return { label: "Needs work", textClass: "text-warning" };
  return { label: "Weak", textClass: "text-destructive" };
}

const severityIcon: Record<RecommendationSeverity, typeof AlertTriangle> = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const severityTextClass: Record<RecommendationSeverity, string> = {
  critical: "text-destructive",
  warning: "text-warning",
  info: "text-muted-foreground",
};

const severityLabel: Record<RecommendationSeverity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
};

function RecommendationRow({ recommendation }: { recommendation: QualityRecommendation }) {
  const Icon = severityIcon[recommendation.severity];
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", severityTextClass[recommendation.severity])} />
      <span className="text-muted-foreground">
        <span className={cn("mr-1.5 text-xs font-semibold uppercase tracking-wide", severityTextClass[recommendation.severity])}>
          {severityLabel[recommendation.severity]}
        </span>
        {recommendation.message}
      </span>
    </li>
  );
}

function StrengthRow({ strength }: { strength: QualityStrength }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-success" />
      <span className="text-muted-foreground">{strength.message}</span>
    </li>
  );
}

export function QualityScorePanel({ report }: QualityScorePanelProps) {
  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Outreach Quality Score</CardTitle>
          <CardDescription>Generate a sequence to see its quality score breakdown.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={Gauge}
            title="No score yet"
            description="Generate a sequence and it'll be scored automatically, so you always know how strong your outreach is."
          />
        </CardContent>
      </Card>
    );
  }

  const overallTone = scoreTone(report.overall);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex flex-col gap-1.5">
          <CardTitle>Outreach Quality Score</CardTitle>
          <CardDescription>A breakdown of what&apos;s working and what could be stronger.</CardDescription>
        </div>
        <div className="flex shrink-0 flex-col items-end">
          <span className={cn("text-3xl font-semibold tracking-tight", overallTone.textClass)}>
            {report.overall}
            <span className="text-base font-normal text-muted-foreground">/100</span>
          </span>
          <span className={cn("text-xs font-medium", overallTone.textClass)}>{overallTone.label}</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          {report.dimensions.map((dimension) => {
            const tone = scoreTone(dimension.score);
            return (
              <div key={dimension.dimension} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {dimension.label}
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      {Math.round(dimension.weight * 100)}% of score
                    </span>
                  </span>
                  <span className={cn("font-medium", tone.textClass)}>{dimension.score}/100</span>
                </div>
                <Progress value={dimension.score} />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What&apos;s working
          </span>
          {report.strengths.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {report.strengths.map((strength, index) => (
                <StrengthRow key={index} strength={strength} />
              ))}
            </ul>
          ) : (
            <span className="text-sm text-muted-foreground">
              Nothing stands out as a clear strength yet — see the recommendations below.
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recommendations
          </span>
          {report.recommendations.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {report.recommendations.map((recommendation, index) => (
                <RecommendationRow key={index} recommendation={recommendation} />
              ))}
            </ul>
          ) : (
            <div className="flex items-start gap-2.5 text-sm">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span className="text-muted-foreground">No major issues found — this sequence looks strong.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
