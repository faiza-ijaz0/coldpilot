"use client";

import * as React from "react";
import { Search, SendHorizonal } from "lucide-react";

import type { GeneratorTone, NicheId, SequenceStatus } from "@/types";
import { useSavedSequences } from "@/hooks/use-saved-sequences";
import { applyEmailEdit } from "@/lib/quality-score/adapters";
import { nicheList } from "@/lib/personalization/niches";
import { toneOptions } from "@/lib/generator/tone-options";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SequenceCard } from "@/components/sequences/sequence-card";
import { RecentSequences } from "@/components/sequences/recent-sequences";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";
import { EmptyState } from "@/components/shared/empty-state";

const statusTabs: { value: SequenceStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export function SavedSequences() {
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<SequenceStatus | "all">("all");
  const [industryFilter, setIndustryFilter] = React.useState<NicheId | "all">("all");
  const [toneFilter, setToneFilter] = React.useState<GeneratorTone | "all">("all");
  const { sequences, recentSequences, deleteSequence, duplicateSequence, renameSequence, updateSequence } =
    useSavedSequences();

  const filtered = sequences
    .filter((sequence) => {
      const matchesStatus = status === "all" || sequence.status === status;
      const matchesIndustry = industryFilter === "all" || sequence.industry === industryFilter;
      const matchesTone = toneFilter === "all" || sequence.tone === toneFilter;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 ||
        sequence.name.toLowerCase().includes(normalizedQuery) ||
        sequence.businessName.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesIndustry && matchesTone && matchesQuery;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function handleUpdateEmail(id: string, slot: Parameters<typeof applyEmailEdit>[1], updates: { subject: string; body: string }) {
    const sequence = sequences.find((item) => item.id === id);
    if (!sequence) return;
    updateSequence(id, applyEmailEdit(sequence, slot, updates));
  }

  return (
    <div className="flex flex-col gap-8">
      <RecentSequences sequences={recentSequences} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Tabs value={status} onValueChange={(value) => setStatus(value as SequenceStatus | "all")}>
              <TabsList>
                {statusTabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="relative sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search sequences..."
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={industryFilter} onValueChange={(value) => setIndustryFilter(value as NicheId | "all")}>
              <SelectTrigger className="sm:w-56">
                <SelectValue placeholder="Filter by industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>
                {nicheList.map((niche) => (
                  <SelectItem key={niche.id} value={niche.id}>
                    {niche.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={toneFilter} onValueChange={(value) => setToneFilter(value as GeneratorTone | "all")}>
              <SelectTrigger className="sm:w-56">
                <SelectValue placeholder="Filter by tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tones</SelectItem>
                {toneOptions.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <StaggerGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((sequence) => (
              <StaggerItem key={sequence.id}>
                <SequenceCard
                  sequence={sequence}
                  onRename={renameSequence}
                  onDuplicate={duplicateSequence}
                  onDelete={deleteSequence}
                  onUpdateEmail={handleUpdateEmail}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <EmptyState
            icon={SendHorizonal}
            title={sequences.length === 0 ? "No saved sequences yet" : "No sequences found"}
            description={
              sequences.length === 0
                ? "Generate a sequence to see it here — every sequence is saved automatically."
                : "Try a different search term or filter."
            }
          />
        )}
      </div>
    </div>
  );
}
