// roguelearn-web/src/lib/skillTreeLayout.ts
import dagre from 'dagre';
import { SkillNode as ApiSkillNode, SkillDependency } from '@/types/skill-tree';

/**
 * Uses the Dagre library to calculate optimal positions for nodes
 * in a hierarchical LEFT-TO-RIGHT layout (horizontal flow).
 * @param nodes - The skill nodes from the API.
 * @param edges - The skill dependencies from the API.
 * @param tierSpacing - The horizontal distance between skill tiers.
 * @returns An array of nodes with calculated x, y positions.
 */
export const layoutSkills = (
  nodes: ApiSkillNode[],
  edges: SkillDependency[],
  tierSpacing: number = 400
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // ⭐ Configure the graph layout for HORIZONTAL (left to right) flow
  dagreGraph.setGraph({
    rankdir: '', // ⭐ Left to Right flow (HORIZONTAL)
    ranksep: tierSpacing, // Horizontal spacing between tiers (left to right)
    nodesep: 200, // Vertical spacing between nodes in the same tier
    edgesep: 50, // Edge separation
  });

  // ⭐ Add nodes with updated dimensions (w-80 = 320px, h-44 = 176px)
  nodes.forEach((node) => {
    dagreGraph.setNode(node.skillId, {
      width: 320, // width of ConstellationNode (w-80)
      height: 176, // height of ConstellationNode (h-44)
    });
  });

  // Add edges to define dependencies (prerequisites point to dependents)
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.prerequisiteSkillId, edge.skillId);
  });

  // Run the layout algorithm
  dagre.layout(dagreGraph);

  // Map the calculated positions back to our nodes
  return nodes.map((node) => {
    const position = dagreGraph.node(node.skillId);
    return {
      id: node.skillId,
      data: node,
      // Center the node on its calculated position (half of width/height)
      position: { x: position.x - 160, y: position.y - 88 },
    };
  });
};