import type { GeneratorTone } from "@/types";

export const greetingBank: Record<GeneratorTone, string[]> = {
  professional: ["Hi {{first_name}},", "Hello {{first_name}},"],
  casual: ["Hey {{first_name}},", "Hi {{first_name}} —"],
  friendly: ["Hi {{first_name}}! ", "Hey {{first_name}}, hope you're doing well."],
  bold: ["{{first_name}} —", "{{first_name}},"],
  formal: ["Dear {{first_name}},", "Good afternoon {{first_name}},"],
};

/** Used when no recipient first name is supplied — a natural opener with no merge field, chosen per tone. */
export const fallbackGreetingBank: Record<GeneratorTone, string[]> = {
  professional: ["Hi there,", "Hello,"],
  casual: ["Hey there,", "Hi,"],
  friendly: ["Hi there!", "Hi team,"],
  bold: ["Hi there —", "Team —"],
  formal: ["Hello,", "Good afternoon,"],
};

export const signOffBank: Record<GeneratorTone, string[]> = {
  professional: ["Best,\n{{senderName}}", "Best regards,\n{{senderName}}"],
  casual: ["Cheers,\n{{senderName}}", "Talk soon,\n{{senderName}}"],
  friendly: ["Talk soon,\n{{senderName}}", "Cheers,\n{{senderName}} 🙂"],
  bold: ["— {{senderName}}", "{{senderName}}"],
  formal: ["Kind regards,\n{{senderName}}", "Sincerely,\n{{senderName}}"],
};

export const postscriptBank: Record<GeneratorTone, string[]> = {
  professional: [
    "P.S. Happy to share more detail if it's useful before you decide either way.",
    "P.S. If timing's off, let me know and I'll follow up next quarter instead.",
  ],
  casual: [
    "P.S. No pressure at all — just figured it was worth a shot.",
    "P.S. Happy to send more info if that's easier than a call.",
  ],
  friendly: [
    "P.S. Would genuinely love to hear how you're tackling this today, even if it's a no for now.",
    "P.S. Feel free to forward this to whoever handles this on your end.",
  ],
  bold: ["P.S. Two-minute read either way.", "P.S. Worth 10 minutes, I think."],
  formal: [
    "P.S. Please do not hesitate to reach out with any questions in the meantime.",
    "P.S. I remain available at your convenience.",
  ],
};
