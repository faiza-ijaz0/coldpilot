import type { NicheConfig } from "@/types";

export const barbershopNiche: NicheConfig = {
  id: "barbershop",
  label: "Barbershop & Beauty",
  vocabulary: {
    audience: "barbershop and salon owners",
    workUnit: "chair bookings",
    metric: "repeat booking rate",
  },
  introductions: [
    "Most barbershop and salon owners I talk to are dealing with {{painPoint}} right after a busy week of {{workUnit}}.",
    "{{company}} looks like a shop that might be feeling what a lot of {{audience}} feel: {{painPoint}}.",
    "A lot of barbershops don't catch {{painPoint}} until {{metric}} starts slipping.",
  ],
  painPoints: [
    "For most shops, that means clients get a great haircut once and never hear from the shop again until they happen to rebook.",
    "It's rarely a stylist skill problem — it's that {{workUnit}} outpace the manual follow-up needed to bring clients back.",
    "Left alone, this usually shows up as {{metric}} dropping without an obvious single cause.",
  ],
  ctas: {
    "book-meeting": [
      "Worth 15 minutes to see how this fits your booking flow?",
      "Open to a quick walkthrough on {{metric}}?",
    ],
    "quick-reply": ["Worth a look at your rebooking flow?", "Is {{metric}} something {{company}} tracks closely?"],
    "phone-call": [
      "Have 10 minutes to talk through your rebooking process?",
      "Quick call on where clients stop coming back?",
    ],
    "send-resource": [
      "Want the rebooking playbook a few shops use?",
      "Should I send the repeat-booking benchmark sheet?",
    ],
    "soft-ask": [
      "Open to hearing more, or not a priority right now?",
      "No pressure — just flag if {{metric}} is worth a look.",
    ],
  },
};
