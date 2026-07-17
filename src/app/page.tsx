import type { Metadata } from "next";

import { SiteShell } from "@/components/layout/site-shell";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { CtaSection } from "@/components/landing/cta-section";

export const metadata: Metadata = {
  title: "ColdPilot — Smart Outreach Sequence Generator",
  description:
    "Generate high-converting cold email sequences built on proven outreach frameworks — tailored to your business in seconds.",
};

export default function LandingPage() {
  return (
    <SiteShell>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <CtaSection />
    </SiteShell>
  );
}
