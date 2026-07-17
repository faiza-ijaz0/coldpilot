import { aidaFramework } from "./aida";
import { pasFramework } from "./pas";
import { babFramework } from "./bab";
import { problemSolutionFramework } from "./problem-solution";
import type { FrameworkDefinition } from "./types";
import type { OutreachFramework } from "@/types";

export const frameworks: FrameworkDefinition[] = [
  aidaFramework,
  pasFramework,
  babFramework,
  problemSolutionFramework,
];

export function frameworkName(id: OutreachFramework): string {
  return frameworks.find((framework) => framework.id === id)?.name ?? id;
}

export type { FrameworkDefinition };
