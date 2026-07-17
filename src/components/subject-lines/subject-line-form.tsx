"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { NicheId, SubjectLineInput } from "@/types";
import { nicheList } from "@/lib/personalization/niches";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialFormState = {
  businessName: "",
  industry: "saas" as NicheId,
  targetAudience: "",
  painPoint: "",
  offer: "",
};

interface SubjectLineFormProps {
  onGenerate: (input: SubjectLineInput) => void;
}

export function SubjectLineForm({ onGenerate }: SubjectLineFormProps) {
  const [form, setForm] = React.useState(initialFormState);

  function updateField<K extends keyof typeof initialFormState>(key: K, value: (typeof initialFormState)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const required: [keyof typeof initialFormState, string][] = [
      ["businessName", "Business name"],
      ["targetAudience", "Target audience"],
      ["painPoint", "Pain point"],
      ["offer", "Offer"],
    ];
    const missing = required.find(([key]) => !form[key].toString().trim());
    if (missing) {
      toast(`${missing[1]} is required`, {
        description: "Fill out every field so we can generate strong subject lines for you.",
      });
      return;
    }

    onGenerate({
      businessName: form.businessName.trim(),
      industry: form.industry,
      targetAudience: form.targetAudience.trim(),
      painPoint: form.painPoint.trim(),
      offer: form.offer.trim(),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject line details</CardTitle>
        <CardDescription>
          Generates at least 10 subject lines across five proven angles — curiosity, pain point, benefit,
          personalized, and question based.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="sl-businessName">Business name</Label>
              <Input
                id="sl-businessName"
                placeholder="e.g. ColdPilot"
                value={form.businessName}
                onChange={(event) => updateField("businessName", event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="sl-industry">Industry / niche</Label>
              <Select value={form.industry} onValueChange={(value) => updateField("industry", value as NicheId)}>
                <SelectTrigger id="sl-industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {nicheList.map((niche) => (
                    <SelectItem key={niche.id} value={niche.id}>
                      {niche.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sl-targetAudience">Target audience</Label>
            <Input
              id="sl-targetAudience"
              placeholder="e.g. Series A SaaS founders"
              value={form.targetAudience}
              onChange={(event) => updateField("targetAudience", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sl-painPoint">Pain point</Label>
            <Textarea
              id="sl-painPoint"
              placeholder="What problem does your prospect struggle with today?"
              value={form.painPoint}
              onChange={(event) => updateField("painPoint", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sl-offer">Offer</Label>
            <Textarea
              id="sl-offer"
              placeholder="What are you offering them, in a few words?"
              value={form.offer}
              onChange={(event) => updateField("offer", event.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="mt-2 w-full gap-2 sm:w-fit">
            <Sparkles className="h-4 w-4" />
            Generate subject lines
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
