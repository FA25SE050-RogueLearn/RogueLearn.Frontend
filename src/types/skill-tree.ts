// roguelearn-web/src/types/skill-tree.ts

/**
 * Feature: Skill Tree
 * Purpose: Defines the structure for visualizing the user's entire skill constellation.
 * Aligns with the `GET /api/skills/tree` backend endpoint.
 */

export interface SkillTree {
  nodes: SkillNode[];
  dependencies: SkillDependency[];
}

export interface SkillNode {
  skillId: string; // Guid
  name: string;
  domain: string | null;
  description: string | null;
  tier: number; // Corresponds to SkillTierLevel enum (1=Foundation, 2=Intermediate, 3=Advanced)
  userLevel: number;
  userExperiencePoints: number;
  // Add index signature to satisfy React Flow's type constraints
  [key: string]: unknown;
}

export interface SkillDependency {
  skillId: string; // Guid
  prerequisiteSkillId: string; // Guid
  relationshipType: 'Prerequisite' | 'Corequisite' | 'Recommended';
}
