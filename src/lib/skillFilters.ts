// roguelearn-web/src/lib/skillFilters.ts
import { SkillNode, SkillDependency } from '@/types/skill-tree';

export type FilterMode = 'all' | 'unlocked' | 'available' | 'next';

/**
 * Filters skill nodes and dependencies based on the selected mode and domain.
 * @param skills - All skill nodes from the API.
 * @param dependencies - All skill dependencies from the API.
 * @param mode - The current filter mode.
 * @param domainFilter - An optional domain to filter by.
 * @returns An object containing the filtered nodes and dependencies.
 */
export const filterSkillTree = (
  skills: SkillNode[],
  dependencies: SkillDependency[],
  mode: FilterMode,
  domainFilter?: string | null
) => {
  // A set of IDs for all skills the user has made progress on.
  const unlockedIds = new Set(
    skills
      .filter(s => s.userLevel > 0 || s.userExperiencePoints > 0)
      .map(s => s.skillId)
  );

  // Helper function to check if all prerequisites for a skill are unlocked.
  const canUnlock = (skillId: string) => {
    const prereqs = dependencies.filter(d => d.skillId === skillId);
    if (prereqs.length === 0) return true; // Foundation skills are always unlockable.
    return prereqs.every(p => unlockedIds.has(p.prerequisiteSkillId));
  };

  let filteredNodes = skills;

  // Apply the primary filter mode.
  switch (mode) {
    case 'unlocked':
      filteredNodes = skills.filter(s => unlockedIds.has(s.skillId));
      break;
    
    case 'available': // Shows unlocked skills AND the next ones that can be unlocked.
      filteredNodes = skills.filter(s => 
        unlockedIds.has(s.skillId) || canUnlock(s.skillId)
      );
      break;
    
    case 'next': // Shows ONLY the next skills that can be unlocked.
      filteredNodes = skills.filter(s => 
        !unlockedIds.has(s.skillId) && canUnlock(s.skillId)
      );
      break;
    
    case 'all':
    default:
      filteredNodes = skills;
      break;
  }

  // Apply the domain filter if one is selected.
  if (domainFilter) {
    filteredNodes = filteredNodes.filter(s => s.domain === domainFilter);
  }
  
  const filteredNodeIds = new Set(filteredNodes.map(n => n.skillId));

  // Only include edges where both the source and target nodes are visible.
  const visibleEdges = dependencies.filter(d =>
    filteredNodeIds.has(d.skillId) && filteredNodeIds.has(d.prerequisiteSkillId)
  );

  return { filteredNodes, visibleEdges };
};