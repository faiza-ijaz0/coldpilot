import type { NicheConfig } from "@/types";

export const healthcareNiche: NicheConfig = {
  id: "healthcare",
  label: "Healthcare",
  vocabulary: {
    audience: "practice managers and clinic owners",
    workUnit: "patient visits",
    metric: "no-show rate",
  },
  introductions: [
    "Most practice managers I talk to are dealing with {{painPoint}} across a growing number of {{workUnit}}.",
    "{{company}} looks like a practice that might be feeling what a lot of {{audience}} feel: {{painPoint}}.",
    "A lot of clinics don't catch {{painPoint}} until {{metric}} shows up in the schedule.",
  ],
  painPoints: [
    "For most practices, that means reminder calls and follow-ups falling on whoever's free at the front desk that day.",
    "It's rarely a staffing problem — it's that {{workUnit}} outpace the manual scheduling workflow.",
    "Left alone, this usually shows up as {{metric}} creeping up without an obvious single cause.",
  ],
  ctas: {
    "book-meeting": [
      "Worth 15 minutes to see how this fits your front-desk workflow?",
      "Open to a quick walkthrough on {{metric}}?",
    ],
    "quick-reply": ["Worth a look for your front desk?", "Is {{metric}} something {{company}} tracks closely?"],
    "phone-call": [
      "Have 10 minutes to talk through your scheduling workflow?",
      "Quick call on where reminders fall through?",
    ],
    "send-resource": [
      "Want the patient-reminder template a few practices use?",
      "Should I send the no-show benchmark sheet?",
    ],
    "soft-ask": [
      "Open to hearing more, or not a priority right now?",
      "No pressure — just flag if {{metric}} is worth a look.",
    ],
  },
};
