import { Mail, Library, Zap } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/stagger-group";

export function SocialProofSection() {
  return (
    <section className="container py-24">
      <StaggerGroup className="grid gap-6 sm:grid-cols-3">
        <StaggerItem>
          <StatCard icon={Library} label="Research frameworks" value="20+" hint="and growing" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Mail} label="Sequences generated" value="12,000+" hint="across all users" />
        </StaggerItem>
        <StaggerItem>
          <StatCard icon={Zap} label="Time to first sequence" value="< 60s" hint="from blank page to ready-to-send" />
        </StaggerItem>
      </StaggerGroup>
    </section>
  );
}
