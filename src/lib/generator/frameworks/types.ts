import type { OutreachFramework } from "@/types";

/**
 * Each stage is a pool of alternative sentences — one is picked at random
 * per generation. Stages are ordered (e.g. Problem, Agitate, Solution).
 */
export interface FrameworkDefinition {
  id: OutreachFramework;
  name: string;
  introduction: string[][];
  followUp: string[][];
  finalFollowUp: string[][];
}
