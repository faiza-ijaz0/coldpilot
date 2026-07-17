import type { NicheConfig } from "@/types";

export const realEstateNiche: NicheConfig = {
  id: "real-estate",
  label: "Real Estate",
  vocabulary: {
    audience: "brokers and team leads",
    workUnit: "listings",
    metric: "showing-to-offer rate",
  },
  introductions: [
    "Most brokers I talk to are dealing with {{painPoint}} across a growing list of {{workUnit}}.",
    "{{company}} looks like a team that might be feeling what a lot of {{audience}} feel right now: {{painPoint}}.",
    "A lot of real estate teams don't notice {{painPoint}} until {{metric}} starts slipping.",
  ],
  painPoints: [
    "For most brokerages, that means follow-up after a showing happens whenever an agent remembers to do it, not on a schedule.",
    "It's rarely the agents — it's that {{workUnit}} move faster than the manual follow-up process can keep up.",
    "Left alone, this tends to show up as {{metric}} dropping without an obvious single cause.",
  ],
  ctas: {
    "book-meeting": [
      "Worth 15 minutes to see how this fits your listing process?",
      "Open to a quick walkthrough on {{metric}}?",
    ],
    "quick-reply": ["Worth a look across your listings?", "Is {{metric}} something {{company}} tracks closely?"],
    "phone-call": [
      "Have 10 minutes to talk through your follow-up process?",
      "Quick call on where showings go cold?",
    ],
    "send-resource": [
      "Want the follow-up template a few brokerages use?",
      "Should I send the showing-to-offer benchmark?",
    ],
    "soft-ask": [
      "Open to hearing more, or not the priority right now?",
      "No pressure — just flag if this is worth a look.",
    ],
  },
};
