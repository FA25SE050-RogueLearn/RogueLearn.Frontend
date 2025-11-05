// roguelearn-web/src/types/skill-tree.ts
export interface SkillTree {
    nodes: SkillNode[];
    dependencies: SkillDependency[];
}

export interface SkillNode {
    skillId: string; // Guid
    name: string;
    domain: string | null;
    description: string | null;
    tier: number;
    userLevel: number;
    userExperiencePoints: number;
}

export interface SkillDependency {
    skillId: string; // Guid
    prerequisiteSkillId: string; // Guid
    relationshipType: 'Prerequisite' | 'Corequisite' | 'Recommended';
}