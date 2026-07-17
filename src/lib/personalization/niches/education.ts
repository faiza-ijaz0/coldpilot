import type { NicheConfig } from "@/types";

export const educationNiche: NicheConfig = {
  id: "education",
  label: "Education",
  vocabulary: {
    audience: "admissions and enrollment leads",
    workUnit: "applicants",
    metric: "enrollment yield",
  },
  introductions: [
    "Most admissions leads I talk to are dealing with {{painPoint}} across a growing pool of {{workUnit}}.",
    "{{company}} looks like a program that might be feeling what a lot of {{audience}} feel: {{painPoint}}.",
    "A lot of schools don't catch {{painPoint}} until {{metric}} comes in lower than planned.",
  ],
  painPoints: [
    "For most programs, that means {{workUnit}} going quiet between application and enrollment because follow-up isn't systematized.",
    "It's rarely the program quality — it's that {{workUnit}} outpace the admissions team's manual follow-up capacity.",
    "Left alone, this usually shows up as {{metric}} slipping without an obvious single cause.",
  ],
  ctas: {
    "book-meeting": [
      "Worth 15 minutes to see how this fits your admissions funnel?",
      "Open to a quick walkthrough on {{metric}}?",
    ],
    "quick-reply": ["Worth a look at your applicant follow-up?", "Is {{metric}} something {{company}} tracks closely?"],
    "phone-call": [
      "Have 10 minutes to talk through your admissions workflow?",
      "Quick call on where applicants go quiet?",
    ],
    "send-resource": [
      "Want the follow-up template a few programs use?",
      "Should I send the enrollment-yield benchmark?",
    ],
    "soft-ask": [
      "Open to hearing more, or not a priority right now?",
      "No pressure — just flag if {{metric}} is worth a look.",
    ],
  },
};
