import type { FrameworkDefinition } from "./types";

export const aidaFramework: FrameworkDefinition = {
  id: "AIDA",
  name: "AIDA (Attention, Interest, Desire, Action)",
  introduction: [
    [
      "Most {{targetAudience}} I talk to are still dealing with {{painPoint}} — and it's usually more expensive than it looks.",
      "A lot of {{industry}} teams tell me {{painPoint}} is the thing eating their week without anyone quite noticing.",
      "{{company}} popped up as a team that might be feeling the same thing a lot of {{targetAudience}} do right now: {{painPoint}}.",
      "Noticed {{company}} is growing in {{industry}} — usually that's exactly when {{painPoint}} starts to bite.",
    ],
    [
      "That's the exact problem {{businessName}} was built around, and it's rarely a people problem — it's a process one.",
      "We built {{businessName}} after seeing the same pattern across {{industry}}: the fix isn't more effort, it's a better system.",
      "It's not that {{targetAudience}} aren't capable — it's that {{painPoint}} tends to compound quietly until it's a real drag on the team.",
      "{{businessName}} exists because this exact gap kept showing up across {{industry}} teams we talked to.",
    ],
    [
      "Teams using {{offer}} usually see the difference within the first couple of weeks — less firefighting, more time back.",
      "The teams that fix this early tend to free up hours a week that were quietly going to {{painPoint}}.",
      "With {{offer}} in place, {{painPoint}} stops being a recurring fire drill and becomes a solved problem.",
      "Once {{offer}} is in place, most {{targetAudience}} tell us it's the first time {{painPoint}} actually felt handled.",
    ],
  ],
  followUp: [
    [
      "Didn't hear back, which usually means either the timing's off or this got buried — totally fine either way.",
      "Wanted to bump this in case it got lost — {{painPoint}} tends to stay quietly expensive the longer it sits.",
      "Following up in case it's useful — a few other {{industry}} teams asked about the same thing after my last note.",
      "One thing I didn't mention last time: {{offer}} usually pays for itself just from the time {{targetAudience}} get back.",
    ],
    [
      "If {{painPoint}} is still on your plate, happy to show exactly how {{businessName}} handles it for teams like {{company}}.",
      "Still think this could save {{company}} real time on {{painPoint}} — happy to make the case in 15 minutes.",
      "If it's helpful, I can share how a similar {{industry}} team solved this with {{businessName}} in about a week.",
    ],
  ],
  finalFollowUp: [
    [
      "Haven't heard back, so I'll assume the timing isn't right for {{company}} at the moment.",
      "I don't want to keep cluttering your inbox, so this will be my last note on {{painPoint}} for now.",
      "Figured I'd try once more, since {{painPoint}} is usually the kind of thing that's easy to deprioritize but costly to ignore.",
    ],
    [
      "If that changes, I'm always around — just reply and I'll pick this back up.",
      "No hard feelings either way — I'll close the loop on this for now.",
      "Wishing {{company}} well with {{painPoint}} either way, whether that's with us or not.",
    ],
  ],
};
