// roguelearn-web/src/lib/skillTreeLayout.ts
import dagre from 'dagre';
import { Edge } from 'reactflow';
import { SkillNode as ApiSkillNode, SkillDependency } from '@/types/skill-tree';

/**
 * Uses the Dagre library to calculate optimal positions for nodes
 * in a hierarchical, top-to-bottom layout.
 * @param nodes - The skill nodes from the API.
 * @param edges - The skill dependencies from the API.
 * @param tierSpacing - The vertical distance between skill tiers.
 * @returns An array of nodes with calculated x, y positions.
 */
export const layoutSkills = (
  nodes: ApiSkillNode[],
  edges: SkillDependency[],
  tierSpacing: number = 250
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Configure the graph layout
  dagreGraph.setGraph({
    rankdir: 'TB', // Top to bottom flow
    ranksep: tierSpacing, // Vertical spacing between tiers
    nodesep: 150, // Horizontal spacing between nodes in the same tier
    edgesep: 50, // Edge separation
  });

  // Add nodes to the graph with their dimensions
  nodes.forEach((node) => {
    dagreGraph.setNode(node.skillId, {
      width: 224, // width of ConstellationNode (w-56)
      height: 128, // height of ConstellationNode (h-32)
    });
  });

  // Add edges to define dependencies
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
      // Center the node on its calculated position
      position: { x: position.x - 112, y: position.y - 64 },
    };
  });
};