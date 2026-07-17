"use client";

import { Bookmark, CalendarDays, CalendarRange, Gauge, Mail, Tag } from "lucide-react";

import { useSavedSequences } from "@/hooks/use-saved-sequences";
import { nicheList } from "@/lib/personalization/niches";
import { toneOptions } from "@/lib/generator/tone-options";
import { isWithinLastDays } from "@/lib/date-range";
import { StatCard } from "@/components/shared/stat-card";
import { EmphasisBarChart } from "@/components/analytics/emphasis-bar-chart";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

export function AnalyticsDashboard() {
  const { sequences, totalGenerated } = useSavedSequences();

  const industryData = nicheList.map((niche) => ({
    label: niche.label,
    value: sequences.filter((sequence) => sequence.industry === niche.id).length,
  }));

  const toneData = toneOptions.map((tone) => ({
    label: tone.label,
    value: sequences.filter((sequence) => sequence.tone === tone.value).length,
  }));

  const averageScore = sequences.length
    ? Math.round(sequences.reduce((sum, sequence) => sum + sequence.score, 0) / sequences.length)
    : 0;

  const generatedThisWeek = sequences.filter((sequence) => isWithinLastDays(sequence.createdAt, 7)).length;
  const generatedThisMonth = sequences.filter((sequence) => isWithinLastDays(sequence.createdAt, 30)).length;

  return (
    <div className="flex flex-col gap-6">
      <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StaggerItem>
          <StatCard
            icon={Mail}
            label="Total generated sequences"
            value={totalGenerated.toLocaleString()}
            hint="Every generation, including regenerations"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Bookmark}
            label="Total saved sequences"
            value={sequences.length.toLocaleString()}
            hint="Currently kept in your library"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={Gauge}
            label="Average outreach score"
            value={sequences.length ? `${averageScore}/100` : "—"}
            hint="Across every saved sequence"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={CalendarDays}
            label="Generated this week"
            value={generatedThisWeek.toLocaleString()}
            hint="Rolling 7-day window"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={CalendarRange}
            label="Generated this month"
            value={generatedThisMonth.toLocaleString()}
            hint="Rolling 30-day window"
          />
        </StaggerItem>
      </StaggerGroup>

      <StaggerGroup className="grid gap-6 lg:grid-cols-2">
        <StaggerItem>
          <EmphasisBarChart
            icon={Gauge}
            title="Most used industry"
            data={industryData}
            emptyTitle="No sequences yet"
            emptyDescription="Generate a sequence to see your industry breakdown."
          />
        </StaggerItem>
        <StaggerItem>
          <EmphasisBarChart
            icon={Tag}
            title="Most used tone"
            data={toneData}
            emptyTitle="No sequences yet"
            emptyDescription="Generate a sequence to see your tone breakdown."
          />
        </StaggerItem>
      </StaggerGroup>
    </div>
  );
}
