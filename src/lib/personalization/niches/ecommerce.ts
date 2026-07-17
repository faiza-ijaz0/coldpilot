import type { NicheConfig } from "@/types";

export const ecommerceNiche: NicheConfig = {
  id: "ecommerce",
  label: "Ecommerce",
  vocabulary: {
    audience: "DTC founders and growth leads",
    workUnit: "carts",
    metric: "cart abandonment rate",
  },
  introductions: [
    "Most DTC founders I talk to are dealing with {{painPoint}} right as {{workUnit}} pile up.",
    "{{company}} looks like a store that might be feeling what a lot of {{audience}} feel: {{painPoint}}.",
    "A lot of ecommerce teams don't notice {{painPoint}} until {{metric}} shows up in the dashboard.",
  ],
  painPoints: [
    "For most stores, that means {{workUnit}} going cold because recovery follow-up isn't systematized past the first email.",
    "It's rarely the product — it's that {{workUnit}} move faster than the manual recovery process can keep up.",
    "Left alone, this usually shows up as {{metric}} creeping up quarter over quarter.",
  ],
  ctas: {
    "book-meeting": [
      "Worth 15 minutes to see how this fits your funnel?",
      "Open to a quick walkthrough on {{metric}}?",
    ],
    "quick-reply": ["Worth a look at your checkout flow?", "Is {{metric}} something {{company}} tracks closely?"],
    "phone-call": [
      "Have 10 minutes to talk through your recovery flow?",
      "Quick call on where carts go cold?",
    ],
    "send-resource": [
      "Want the cart-recovery playbook a few stores use?",
      "Should I send the abandonment benchmark sheet?",
    ],
    "soft-ask": [
      "Open to hearing more, or not a priority right now?",
      "No pressure — just flag if {{metric}} is worth a look.",
    ],
  },
};
