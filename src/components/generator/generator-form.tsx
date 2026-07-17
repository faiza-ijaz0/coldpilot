"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import type { CTAType, EmailLength, GeneratorInput, GeneratorTone, NicheId } from "@/types";
import { nicheList } from "@/lib/personalization/niches";
import { toneOptions } from "@/lib/generator/tone-options";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emailLengthOptions: { value: EmailLength; label: string }[] = [
  { value: "short", label: "Short — one tight paragraph" },
  { value: "medium", label: "Medium — a few short paragraphs" },
  { value: "long", label: "Long — fuller detail + P.S." },
];

const ctaTypeOptions: { value: CTAType; label: string }[] = [
  { value: "book-meeting", label: "Book a meeting" },
  { value: "quick-reply", label: "Quick reply" },
  { value: "phone-call", label: "Phone call" },
  { value: "send-resource", label: "Send a resource" },
  { value: "soft-ask", label: "Soft, no-pressure ask" },
];

const initialFormState = {
  businessName: "",
  industry: "saas" as NicheId,
  targetAudience: "",
  painPoint: "",
  offer: "",
  tone: "professional" as GeneratorTone,
  emailLength: "medium" as EmailLength,
  ctaType: "quick-reply" as CTAType,
};

interface GeneratorFormProps {
  onGenerate: (input: GeneratorInput) => void;
}

export function GeneratorForm({ onGenerate }: GeneratorFormProps) {
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
        description: "Fill out every field so we can build a strong sequence for you.",
      });
      return;
    }

    onGenerate({
      businessName: form.businessName.trim(),
      industry: form.industry,
      targetAudience: form.targetAudience.trim(),
      painPoint: form.painPoint.trim(),
      offer: form.offer.trim(),
      tone: form.tone,
      emailLength: form.emailLength,
      ctaType: form.ctaType,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sequence details</CardTitle>
        <CardDescription>
          Describe your business and prospect — the engine assembles a unique 3-email sequence
          from researched frameworks every time you generate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="businessName">Business name</Label>
              <Input
                id="businessName"
                placeholder="e.g. ColdPilot"
                value={form.businessName}
                onChange={(event) => updateField("businessName", event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="industry">Industry / niche</Label>
              <Select value={form.industry} onValueChange={(value) => updateField("industry", value as NicheId)}>
                <SelectTrigger id="industry">
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
            <Label htmlFor="targetAudience">Target audience</Label>
            <Input
              id="targetAudience"
              placeholder="e.g. Series A SaaS founders"
              value={form.targetAudience}
              onChange={(event) => updateField("targetAudience", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="painPoint">Pain point</Label>
            <Textarea
              id="painPoint"
              placeholder="What problem does your prospect struggle with today?"
              value={form.painPoint}
              onChange={(event) => updateField("painPoint", event.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="offer">Offer</Label>
            <Textarea
              id="offer"
              placeholder="What are you offering them, in a few words?"
              value={form.offer}
              onChange={(event) => updateField("offer", event.target.value)}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={form.tone} onValueChange={(value) => updateField("tone", value as GeneratorTone)}>
                <SelectTrigger id="tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((tone) => (
                    <SelectItem key={tone.value} value={tone.value}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="emailLength">Email length</Label>
              <Select
                value={form.emailLength}
                onValueChange={(value) => updateField("emailLength", value as EmailLength)}
              >
                <SelectTrigger id="emailLength">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent>
                  {emailLengthOptions.map((length) => (
                    <SelectItem key={length.value} value={length.value}>
                      {length.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="ctaType">CTA type</Label>
              <Select value={form.ctaType} onValueChange={(value) => updateField("ctaType", value as CTAType)}>
                <SelectTrigger id="ctaType">
                  <SelectValue placeholder="Select CTA" />
                </SelectTrigger>
                <SelectContent>
                  {ctaTypeOptions.map((cta) => (
                    <SelectItem key={cta.value} value={cta.value}>
                      {cta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" size="lg" className="mt-2 w-full gap-2 sm:w-fit">
            <Sparkles className="h-4 w-4" />
            Generate sequence
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
