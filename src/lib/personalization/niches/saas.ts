import type { NicheConfig } from "@/types";

export const saasNiche: NicheConfig = {
  id: "saas",
  label: "SaaS",
  vocabulary: {
    audience: "SaaS founders and RevOps leads",
    workUnit: "trial signups",
    metric: "activation rate",
  },
  introductions: [
    "Most {{audience}} I talk to are wrestling with {{painPoint}} right around the time {{workUnit}} start piling up.",
    "{{company}} caught my eye as a SaaS team that's probably feeling the same squeeze a lot of {{audience}} do: {{painPoint}}.",
    "A lot of SaaS teams don't notice {{painPoint}} until it's already dragging down {{metric}}.",
  ],
  painPoints: [
    "For most SaaS teams, that shows up as manual follow-up slipping through the cracks right when {{workUnit}} are most likely to convert.",
    "It's rarely the product — it's the handoff between marketing and sales that quietly costs SaaS teams their {{metric}}.",
    "Left unaddressed, this usually shows up in the numbers first: {{metric}} drifts down before anyone can point to why.",
  ],
  ctas: {
    "book-meeting": [
      "Worth 15 minutes to see how this maps to your funnel?",
      "Open to a quick walkthrough of how this affects {{metric}}?",
    ],
    "quick-reply": ["Worth a look for your funnel?", "Is {{metric}} even on your radar right now?"],
    "phone-call": [
      "Have 10 minutes to talk through your funnel this week?",
      "Quick call to see where {{workUnit}} are leaking?",
    ],
    "send-resource": [
      "Want the breakdown on how SaaS teams usually fix this?",
      "Should I send the funnel audit template?",
    ],
    "soft-ask": [
      "Open to hearing how this usually gets fixed, or not a priority right now?",
      "No pressure — just flag if {{metric}} matters this quarter.",
    ],
  },
};
