import type { GeneratorTone } from "@/types";

export const greetingBank: Record<GeneratorTone, string[]> = {
  professional: ["Hi {{first_name}},", "Hello {{first_name}},"],
  casual: ["Hey {{first_name}},", "Hi {{first_name}} —"],
  friendly: ["Hi {{first_name}}! ", "Hey {{first_name}}, hope you're doing well."],
  bold: ["{{first_name}} —", "{{first_name}},"],
  formal: ["Dear {{first_name}},", "Good afternoon {{first_name}},"],
};

export const signOffBank: Record<GeneratorTone, string[]> = {
  professional: ["Best,\n{{businessName}}", "Best regards,\n{{businessName}}"],
  casual: ["Cheers,\n{{businessName}}", "Talk soon,\n{{businessName}}"],
  friendly: ["Talk soon,\n{{businessName}}", "Cheers,\n{{businessName}} 🙂"],
  bold: ["— {{businessName}}", "{{businessName}}"],
  formal: ["Kind regards,\n{{businessName}}", "Sincerely,\n{{businessName}}"],
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
