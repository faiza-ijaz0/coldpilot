import type { NicheConfig } from "@/types";

export const carDealershipsNiche: NicheConfig = {
  id: "car-dealerships",
  label: "Car Dealerships",
  vocabulary: {
    audience: "GMs and sales managers",
    workUnit: "test drives",
    metric: "lead follow-up rate",
  },
  introductions: [
    "Most dealership GMs I talk to are dealing with {{painPoint}} right after {{workUnit}} wrap up.",
    "{{company}} looks like a dealership that might be feeling what a lot of {{audience}} feel: {{painPoint}}.",
    "A lot of dealerships don't catch {{painPoint}} until {{metric}} shows it in the CRM.",
  ],
  painPoints: [
    "For most dealerships, that means leads from {{workUnit}} going quiet after 48 hours because follow-up isn't systematized.",
    "It's rarely the sales team — it's that {{workUnit}} outpace the manual follow-up process during busy weekends.",
    "Left alone, this shows up as {{metric}} dropping right when the lot is busiest.",
  ],
  ctas: {
    "book-meeting": [
      "Worth 15 minutes to see how this fits your floor process?",
      "Open to a quick walkthrough on {{metric}} this week?",
    ],
    "quick-reply": ["Worth a look for your floor team?", "Is {{metric}} something you're tracking closely at {{company}}?"],
    "phone-call": [
      "Have 10 minutes to talk through your follow-up process?",
      "Quick call on where leads go quiet?",
    ],
    "send-resource": [
      "Want the follow-up playbook a few dealerships use?",
      "Should I send the lead-response benchmark sheet?",
    ],
    "soft-ask": [
      "Open to hearing more, or not a priority this month?",
      "No pressure — just flag if {{metric}} is worth a look.",
    ],
  },
};
