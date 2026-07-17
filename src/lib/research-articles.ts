import type { ResearchArticle } from "@/types";

/**
 * Static sample content used to populate the Research Library.
 * Replace with real, sourced content once the editorial pipeline exists.
 */
export const researchArticles: ResearchArticle[] = [
  {
    id: "sl-curiosity-gap",
    category: "subject-lines",
    title: "The Curiosity Gap Framework",
    summary:
      "Open a loop the reader can only close by opening the email — without slipping into clickbait.",
    readTimeMinutes: 4,
    tags: ["open-rate", "psychology", "first-touch"],
    keyTakeaways: [
      "Curiosity gaps work because unresolved questions create mild cognitive tension.",
      "The gap must be relevant to the reader's role, not just intriguing in the abstract.",
      "Pair curiosity with specificity — vague mystery reads as spam.",
    ],
    body: [
      "The curiosity gap is one of the oldest tools in direct-response copywriting, and it still works in cold email because it exploits a simple mechanic: an open question is uncomfortable to leave open. When a subject line implies information the reader doesn't have but clearly should, the email becomes the fastest way to resolve that discomfort.",
      "The failure mode is treating curiosity as an excuse for vagueness. 'A question about your team' is a curiosity gap, but it's also indistinguishable from a hundred other cold emails. 'Why {{competitor}} moved off {{tool}} last quarter' is a curiosity gap with a specific, relevant hook — it signals the sender did homework and that the payoff is worth the open.",
      "A reliable structure: name a specific entity (a competitor, a metric, a recent event) + imply an outcome or insight + leave the mechanism unstated. The reader can guess the topic but not the answer.",
      "Use this framework for first-touch, cold prospects where you have no existing relationship to trade on. It loses effectiveness in later follow-ups, where directness tends to outperform mystery.",
    ],
  },
  {
    id: "sl-personal-specific",
    category: "subject-lines",
    title: "Personal + Specific: The Modern Subject Line Formula",
    summary:
      "Inboxes have gotten better at flagging generic-sounding subject lines. Specificity is the counter.",
    readTimeMinutes: 3,
    tags: ["deliverability", "personalization", "formula"],
    keyTakeaways: [
      "Generic subject lines increasingly get pattern-matched as bulk mail, even when sent one-to-one.",
      "Naming a person, company, or number lowers the reader's guard.",
      "Lowercase, sentence-style subject lines often outperform title case in cold contexts.",
    ],
    body: [
      "As spam filters and human readers alike get better at recognizing templated outreach, the subject lines that still land are the ones that couldn't have been sent to anyone else. 'Quick question, {{first_name}}' does the minimum. '{{company}}'s Q3 hiring page + your ATS' does more — it references something true and specific about the recipient.",
      "The formula: one concrete detail (a name, a number, a recent event) plus one implied relevance to the reader's job. You don't need both in every subject line, but you need at least one, every time.",
      "Style matters too. Cold emails that read like a colleague wrote them — lowercase, short, conversational — consistently outperform ones formatted like a marketing campaign. Save title case and exclamation points for newsletters, not outbound.",
    ],
  },
  {
    id: "pers-beyond-first-name",
    category: "personalization",
    title: "Beyond {{first_name}}: Real Personalization at Scale",
    summary:
      "Merge fields create the appearance of personalization without the substance. Here's what actually reads as personal.",
    readTimeMinutes: 5,
    tags: ["scale", "research", "authenticity"],
    keyTakeaways: [
      "Name and company merge fields are now a baseline expectation, not a differentiator.",
      "Personalization that references a choice the prospect made reads as more genuine than personalization that references a fact about them.",
      "One well-researched line beats three shallow ones.",
    ],
    body: [
      "Merge-field personalization ({{first_name}}, {{company}}) was novel a decade ago. Today it's the floor, not the ceiling — every prospect has seen a hundred emails that open with their own name and still felt like spam. The name isn't what makes something feel personal; the reasoning behind the email is.",
      "The strongest personalization references a decision the prospect made: a tool they chose, content they published, a role they posted for. These signal that you looked at something they actively did, not just a data field that was scraped about them. 'Saw you're hiring two SDRs this month' lands harder than 'I noticed you work in sales,' because the first is a choice and the second is a category.",
      "Depth beats volume. One line that demonstrates real research — reading their latest blog post, noticing a specific product change — outperforms three generic personalization touches stacked together. If you can't find one genuine, specific detail, it's often better to lead with the pain point instead of forcing weak personalization.",
    ],
  },
  {
    id: "pers-trigger-event",
    category: "personalization",
    title: "The Trigger Event Method",
    summary:
      "Timing outreach around a real change in the prospect's world — funding, hiring, a launch — turns cold email into a relevant nudge.",
    readTimeMinutes: 4,
    tags: ["timing", "relevance", "signals"],
    keyTakeaways: [
      "Trigger events give you a legitimate, non-manufactured reason to reach out now.",
      "The best triggers correlate with the problem your product solves.",
      "Reference the trigger, then bridge to the pain — don't just narrate the news back to them.",
    ],
    body: [
      "A trigger event is any observable change in a prospect's world that plausibly creates or surfaces the problem you solve: a funding round, a new executive hire, a job posting, a product launch, a public complaint. Anchoring outreach to a trigger event answers the question every prospect asks unconsciously — 'why is this landing in my inbox today?'",
      "Not every trigger is equally useful. The strongest ones correlate directly with your product's relevance. A Series A raise is a weak trigger for a scheduling tool but a strong one for a recruiting platform, because headcount growth is the actual mechanism connecting the event to the pain.",
      "Avoid simply reporting the news back to the prospect ('Congrats on your Series A!') without a bridge. The trigger should set up the pain point, not stand alone as a compliment. 'Congrats on the Series A — teams scaling from 20 to 60 usually feel their ATS break around month three' does both.",
    ],
  },
  {
    id: "pp-pas",
    category: "pain-points",
    title: "Problem-Agitate-Solve for Cold Email",
    summary:
      "The oldest pain-point structure in direct response, adapted for a two-paragraph cold email.",
    readTimeMinutes: 4,
    tags: ["pas", "structure", "classic"],
    keyTakeaways: [
      "Naming the problem first signals empathy before you signal a pitch.",
      "The agitate step should use the prospect's own likely language, not your product's.",
      "Keep the solve brief in the first email — it's an invitation to a conversation, not a full pitch.",
    ],
    body: [
      "Problem-Agitate-Solve works because it mirrors how people actually process a sales message: first they check whether you understand their situation, then whether the situation is worth acting on, and only then whether your solution matters. Skipping straight to the solve reads as a sales pitch; starting with the problem reads as insight.",
      "The 'agitate' step is where most cold emails go too far or not far enough. The goal isn't to manufacture anxiety — it's to make the cost of the status quo concrete. 'Manual follow-up tracking' is a problem statement. 'Manual follow-up tracking usually means the fourth and fifth touches — the ones most likely to convert — just don't happen' is agitation grounded in a real consequence.",
      "In a first-touch email, keep the solve to a single sentence, and make it about the outcome, not the feature list. The point of PAS in cold outreach is to earn a reply, not to close the deal in one message.",
    ],
  },
  {
    id: "pp-identify-pain",
    category: "pain-points",
    title: "How to Identify Pain Points Before You Write a Word",
    summary:
      "Effective pain-point messaging starts with research, not with a copywriting technique.",
    readTimeMinutes: 5,
    tags: ["research", "icp", "discovery"],
    keyTakeaways: [
      "The best pain points come from customer interviews and support tickets, not assumptions.",
      "Segment pain points by role — a VP and an IC at the same company feel different pressure.",
      "Validate a pain point by checking if it shows up unprompted in reviews or forums.",
    ],
    body: [
      "Pain-point messaging is only as good as the pain point it's built on, and most cold emails guess instead of research. The fastest fix is to mine existing customer conversations — sales call transcripts, support tickets, churn interviews — for the exact phrases prospects use to describe their frustration, then reuse that language rather than paraphrasing it into marketing-speak.",
      "Pain is role-specific. A VP of Sales worries about forecast accuracy and quota attainment; an SDR on that same team worries about running out of the day before running out of tasks. Messaging that speaks to 'the team's productivity' in the abstract misses both audiences. Segment your pain-point library by persona, not just by product feature.",
      "A useful validation check: search review sites, Reddit, or community forums for your product category and see whether the pain point shows up unprompted, in the prospect's own words. If it only exists in your own sales deck, it's a hypothesis, not a validated pain point.",
    ],
  },
  {
    id: "fu-second-touch",
    category: "follow-up-psychology",
    title: "Why Most Replies Come After Follow-Up #2",
    summary:
      "Reply-rate data across outbound campaigns consistently shows the first email is not where most replies happen.",
    readTimeMinutes: 4,
    tags: ["cadence", "data", "persistence"],
    keyTakeaways: [
      "A single cold email competes with everything else in someone's inbox at that exact moment — timing, not quality, is often the deciding factor.",
      "Each follow-up should add new information, not repeat the ask.",
      "Three to five touches over two to three weeks is a common effective range before diminishing returns set in.",
    ],
    body: [
      "It's tempting to read a non-reply as rejection, but in aggregate outbound data, the first email is usually the weakest performer in a sequence — not because it's worse copy, but because timing is mostly luck. The prospect might be in back-to-back meetings, mid-sprint, or simply triaging inbox by subject line that day. A second and third touch aren't asking the same question twice; they're catching the same person at a different, possibly better, moment.",
      "The follow-ups that work don't just restate the original ask. Each one should carry something the prior email didn't: a different angle on the pain point, a piece of social proof, a shorter and more direct version of the ask. Repetition without new information reads as nagging; variation reads as genuine interest.",
      "Most effective sequences run three to five touches across two to three weeks. Fewer than that under-invests in a channel where timing dominates; more than that tends to produce diminishing, and eventually negative, returns as annoyance outweighs persistence.",
    ],
  },
  {
    id: "fu-pattern-interrupt",
    category: "follow-up-psychology",
    title: "The Pattern-Interrupt Follow-Up",
    summary:
      "When the first two touches look like typical sales emails, a follow-up that breaks the pattern can reset attention.",
    readTimeMinutes: 3,
    tags: ["breakup-email", "attention", "tactic"],
    keyTakeaways: [
      "A short, low-pressure 'breakup' email often outperforms a third value-add pitch.",
      "Pattern interrupts work by contrast — they only stand out if prior touches were conventional.",
      "Use humor and brevity carefully; the tone should still match your brand.",
    ],
    body: [
      "By the third or fourth touch in a sequence, prospects have usually pattern-matched what kind of email is arriving before they finish reading the subject line — and that recognition is what gets it archived unread. A pattern-interrupt breaks the expected shape: shorter than the others, lower-pressure, sometimes explicitly acknowledging that this is the last note.",
      "The classic version is the 'breakup email' — a short, no-pressure message that says, in effect, 'I'll stop reaching out, but wanted to leave the door open.' It works because it removes the implicit pressure of a sales ask, which paradoxically makes it easier for a genuinely interested prospect to respond.",
      "This only works in contrast to what came before. If every email in the sequence is already short and low-pressure, there's no pattern left to interrupt. Save this technique for the final touch in a more conventional sequence.",
    ],
  },
  {
    id: "cta-micro-asks",
    category: "cta-examples",
    title: "Micro-CTAs: Asking for Less to Get More",
    summary:
      "Lowering the size of the ask in a cold email often raises the reply rate more than improving the pitch does.",
    readTimeMinutes: 4,
    tags: ["conversion", "friction", "examples"],
    keyTakeaways: [
      "A 30-minute meeting is a much bigger ask than a one-word reply — start smaller.",
      "Binary or low-effort CTAs reduce the decision cost for the reader.",
      "Match the size of the ask to how much trust has been built so far.",
    ],
    body: [
      "The size of the call-to-action is a form of friction, and friction is one of the most controllable variables in a cold email. Asking a stranger for a 30-minute meeting on the first touch requires them to open a calendar, weigh their schedule, and commit — three decisions before they've decided you're worth 30 seconds of their time.",
      "Micro-CTAs lower that cost. 'Worth a look?' or 'Open to a quick reply either way?' only requires a one-word answer, which is a far smaller commitment than a meeting. Once that small yes exists, escalating to a call in the next message is much easier — you're building on an established exchange, not starting cold.",
      "Match ask size to trust level. First touch: a yes/no question or a link. Second or third touch, once there's been some engagement: a specific time suggestion. Jumping straight to 'grab 30 minutes on my calendar' in a first cold email is usually asking for more commitment than the relationship has earned.",
    ],
  },
  {
    id: "cta-lines-that-work",
    category: "cta-examples",
    title: "10 CTA Lines That Outperform 'Let Me Know If Interested'",
    summary:
      "A swipe file of low-friction, specific closing lines to replace the most overused CTA in cold email.",
    readTimeMinutes: 3,
    tags: ["swipe-file", "copywriting", "examples"],
    keyTakeaways: [
      "'Let me know if interested' asks the reader to do all the work of deciding next steps.",
      "Specific, low-effort CTAs consistently outperform open-ended ones.",
      "Rotate CTA style across a sequence so the ask doesn't feel repetitive.",
    ],
    body: [
      "'Let me know if interested' is the default closing line for a reason — it's safe — but it's also passive. It puts the entire burden of deciding what happens next on the reader, which means most readers simply do nothing. Specific, low-friction CTAs consistently outperform it because they remove that decision.",
      "A few reliable alternatives: 'Worth a 2-minute read?' (links to a resource), 'Should I send over the one-pager?', 'Is this even the right problem for your team right now?', 'Who's the best person to talk to about this?', 'Want me to hold a slot Thursday at 2pm, or does another time work better?', 'Reply with a thumbs up and I'll send details.'",
      "Vary the CTA across a sequence rather than repeating the same line. If every email ends with the same ask, later touches feel like reruns rather than a genuine continued attempt to help.",
    ],
  },
  {
    id: "mistakes-top-seven",
    category: "outreach-mistakes",
    title: "The 7 Mistakes Killing Your Reply Rate",
    summary:
      "The most common, avoidable errors seen across underperforming cold outreach campaigns.",
    readTimeMinutes: 5,
    tags: ["diagnosis", "checklist", "reply-rate"],
    keyTakeaways: [
      "Leading with your company instead of the prospect's problem is the single most common mistake.",
      "Long paragraphs signal effort spent on the sender, not the reader.",
      "Sending from a domain with no warm-up history is a deliverability mistake, not a copy mistake.",
    ],
    body: [
      "Across underperforming campaigns, a small set of mistakes shows up again and again. First: leading with 'We are a company that...' instead of the prospect's situation. The first line is the most valuable real estate in the email, and spending it on your own company forfeits the reader's attention before you've earned it.",
      "Second: paragraphs. A wall of text signals a sales pitch before it's even read; three to five short lines read as a note from a person. Third: attachments and heavy formatting on a first touch, which reads as a marketing blast and can hurt deliverability. Fourth: a single, generic CTA that doesn't match how much trust has been built yet.",
      "Fifth: no follow-up at all — most replies come after the second or third touch, so a one-and-done campaign structurally under-performs regardless of copy quality. Sixth: sending at scale from a fresh domain with no warm-up period, which is a deliverability problem that no amount of better copywriting will fix. Seventh: not segmenting messaging by persona, so a VP and an individual contributor at the same company get the identical pitch.",
    ],
  },
  {
    id: "mistakes-checking-in",
    category: "outreach-mistakes",
    title: "Why 'Just Checking In' Is Costing You Deals",
    summary:
      "The most common follow-up opener is also one of the weakest — here's what to send instead.",
    readTimeMinutes: 3,
    tags: ["follow-up", "copywriting", "common-error"],
    keyTakeaways: [
      "'Just checking in' carries no new information and gives the reader no reason to respond now.",
      "It implicitly signals the sender has nothing else to say.",
      "Replace it with a follow-up that adds value, context, or a smaller ask.",
    ],
    body: [
      "'Just checking in' is likely the single most-sent follow-up opener in cold email, and it's weak for a structural reason: it carries zero new information. The prospect already knows you sent an email and are waiting on a reply — restating that fact doesn't give them anything new to react to, so it's easy to skip.",
      "Worse, it subtly signals that the sender has run out of things to say, which undercuts the value of everything sent so far. A prospect reading it unconsciously registers: if this is all they've got as a follow-up, maybe the original offer wasn't that compelling either.",
      "A stronger follow-up replaces the check-in with something new: a relevant article, a sharper version of the original pain point, a piece of social proof from a similar company, or simply a smaller, easier ask than the first email made. The goal of a follow-up is to add a reason to respond now, not to remind the prospect that they haven't yet.",
    ],
  },
];
