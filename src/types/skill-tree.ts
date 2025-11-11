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
  tier: number; // Corresponds to SkillTierLevel enum
  userLevel: number;
  userExperiencePoints: number;
}

export interface SkillDependency {
  skillId: string; // Guid
  prerequisiteSkillId: string; // Guid
  relationshipType: 'Prerequisite' | 'Corequisite' | 'Recommended';
}