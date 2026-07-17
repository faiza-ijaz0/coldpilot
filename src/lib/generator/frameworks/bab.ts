import type { FrameworkDefinition } from "./types";

export const babFramework: FrameworkDefinition = {
  id: "BAB",
  name: "BAB (Before, After, Bridge)",
  introduction: [
    [
      "Right now, a lot of {{targetAudience}} are stuck dealing with {{painPoint}} manually, week after week.",
      "Before {{businessName}}, most {{industry}} teams we talk to are patching {{painPoint}} together with workarounds.",
      "{{company}}'s probably feeling what most {{targetAudience}} feel at this stage: {{painPoint}} eating time that should go elsewhere.",
    ],
    [
      "Imagine {{painPoint}} just... handled — no manual patchwork, no weekly scramble.",
      "Picture the team's week without {{painPoint}} taking up a chunk of it — that's the actual shift teams describe.",
      "The teams that fix this get their attention back for the work that actually grows {{industry}} businesses like {{company}}'s.",
    ],
    [
      "{{offer}} is the bridge — it's what gets {{targetAudience}} from the manual version of this to the handled version.",
      "That's exactly the gap {{businessName}} closes with {{offer}}.",
      "{{offer}} was built to be that bridge for {{targetAudience}} dealing with exactly this.",
    ],
  ],
  followUp: [
    [
      "Still thinking about what {{company}}'s week could look like without {{painPoint}} in the way.",
      "Wanted to follow up — the 'after' here is genuinely just less time lost to {{painPoint}}, week over week.",
    ],
    [
      "{{offer}} is the fastest path there — happy to show what that looks like for a team like {{company}}.",
      "If useful, I can walk through exactly how {{businessName}} gets teams from here to there.",
    ],
  ],
  finalFollowUp: [
    [
      "Last try — {{offer}} is built to get {{targetAudience}} past {{painPoint}} for good.",
      "I'll leave the door open on this one: {{businessName}} is here whenever {{painPoint}} becomes a priority.",
    ],
    [
      "No worries if not now — just didn't want to leave this hanging.",
      "Either way, wishing {{company}} well tackling this.",
    ],
  ],
};
