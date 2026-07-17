import type { FrameworkDefinition } from "./types";

export const problemSolutionFramework: FrameworkDefinition = {
  id: "PROBLEM_SOLUTION",
  name: "Problem-Solution",
  introduction: [
    [
      "Across {{industry}}, {{painPoint}} is one of the most common operational gaps we see in {{targetAudience}}.",
      "{{painPoint}} shows up consistently as a bottleneck for {{targetAudience}}, based on what we're seeing across {{industry}}.",
      "Teams like {{company}}'s usually trace the same root issue back to one thing: {{painPoint}}.",
    ],
    [
      "{{businessName}} addresses this directly through {{offer}}, built specifically for {{targetAudience}}.",
      "{{offer}} is a direct fix for {{painPoint}} — not a workaround, a replacement for the manual process.",
      "The straightforward fix is {{offer}}, which removes {{painPoint}} from the day-to-day entirely.",
    ],
    [
      "Given where {{company}} sits in {{industry}}, this is usually a quick, low-risk thing to test.",
      "For teams the size and stage of {{company}}, this tends to be a fast, low-lift fit.",
      "This is typically most relevant for {{targetAudience}} dealing with {{painPoint}} at {{company}}'s stage.",
    ],
  ],
  followUp: [
    [
      "Following up on {{painPoint}} — still think {{offer}} is a strong fit for {{company}} given what's typical in {{industry}}.",
      "Wanted to circle back on this, since {{painPoint}} rarely resolves itself without a structural fix.",
    ],
    [
      "A comparable {{industry}} team recently solved this exact problem with {{businessName}} in under a month.",
      "Happy to share the data on how {{offer}} performs for teams similar to {{company}}.",
    ],
  ],
  finalFollowUp: [
    [
      "Last note: {{painPoint}}, solved via {{offer}} — that's the short version of what {{businessName}} does.",
      "I'll close the loop here — {{offer}} remains available whenever {{painPoint}} becomes a priority for {{company}}.",
    ],
    [
      "No response needed if it's not relevant right now.",
      "Appreciate the time either way.",
    ],
  ],
};
