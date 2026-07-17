import type { NicheConfig } from "@/types";

export const agenciesNiche: NicheConfig = {
  id: "agencies",
  label: "Agencies",
  vocabulary: {
    audience: "agency owners and account leads",
    workUnit: "client accounts",
    metric: "billable utilization",
  },
  introductions: [
    "Most agency owners I talk to are juggling {{painPoint}} across a dozen {{workUnit}} at once.",
    "{{company}} looks like an agency dealing with the same thing a lot of {{audience}} run into: {{painPoint}}.",
    "Between scope creep and reporting, {{painPoint}} tends to quietly eat into {{metric}} at agencies.",
  ],
  painPoints: [
    "For agencies, that usually means account leads spending Friday afternoons on status decks instead of billable work.",
    "It's rarely a talent problem — it's that {{workUnit}} pile up faster than the team can systematize reporting.",
    "Left alone, this shows up as {{metric}} slipping quarter over quarter without an obvious single cause.",
  ],
  ctas: {
    "book-meeting": [
      "Worth 15 minutes to see how this fits your account structure?",
      "Open to a quick call on where {{metric}} is leaking?",
    ],
    "quick-reply": ["Worth a look across your accounts?", "Is {{metric}} tracked closely at {{company}} right now?"],
    "phone-call": [
      "Have 10 minutes to walk through your account workflow?",
      "Quick call on where reporting time is going?",
    ],
    "send-resource": [
      "Want the agency reporting template we usually share?",
      "Should I send over the account audit checklist?",
    ],
    "soft-ask": [
      "Open to a quick look, or not the priority right now?",
      "No pressure — just flag if this is worth 10 minutes.",
    ],
  },
};
