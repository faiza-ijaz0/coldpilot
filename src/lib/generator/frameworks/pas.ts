import type { FrameworkDefinition } from "./types";

export const pasFramework: FrameworkDefinition = {
  id: "PAS",
  name: "PAS (Problem, Agitate, Solution)",
  introduction: [
    [
      "Most {{targetAudience}} run into the same issue: {{painPoint}}.",
      "A recurring theme we hear from {{industry}} teams is {{painPoint}}.",
      "{{company}} is probably no stranger to {{painPoint}} — it's close to universal in {{industry}}.",
    ],
    [
      "Left alone, that usually turns into missed follow-through, wasted hours, and a team that's busy but not actually moving faster.",
      "The tricky part is it rarely looks urgent day to day — it just quietly costs {{targetAudience}} time until it's a real bottleneck.",
      "What starts as a small inefficiency around {{painPoint}} tends to snowball into a full-time tax on the team's attention.",
    ],
    [
      "{{businessName}} was built specifically to remove that — {{offer}} handles it so {{targetAudience}} don't have to think about it.",
      "That's exactly what {{offer}} solves, without adding another tool {{targetAudience}} have to babysit.",
      "{{offer}} exists to take {{painPoint}} off {{targetAudience}}'s plate entirely.",
    ],
  ],
  followUp: [
    [
      "Didn't want to let this drop — {{painPoint}} tends to get more expensive, not less, the longer it sits unaddressed.",
      "Following up because {{painPoint}} is usually the kind of problem that's easy to postpone and hard to catch up on later.",
    ],
    [
      "{{offer}} is designed to fix this in weeks, not quarters — happy to walk through how.",
      "If useful, I can show exactly how {{businessName}} solves this for teams like {{company}}.",
    ],
  ],
  finalFollowUp: [
    [
      "Last note — {{painPoint}}, and how {{offer}} solves it.",
      "I'll leave this here: if {{painPoint}} becomes a priority, {{businessName}} is built exactly for that.",
    ],
    [
      "No pressure either way, and I won't keep following up after this.",
      "Happy to pick this back up whenever the timing's better for {{company}}.",
    ],
  ],
};
