// roguelearn-web/src/components/skills/SkillTreeComponent.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

import skillsApi from '@/api/skillsApi';
import { SkillTree, SkillNode as ApiSkillNode } from '@/types/skill-tree';
import { Loader2 } from 'lucide-react';
import { SkillNode } from './SkillNode';

// Define the custom node types for React Flow
const nodeTypes = {
  skillNode: SkillNode,
};

// This utility function converts your API data into the format React Flow needs
const convertApiDataToFlowElements = (data: SkillTree) => {
  const nodes: Node[] = data.nodes.map((node: ApiSkillNode, index) => ({
    id: node.skillId,
    type: 'skillNode', // Use our custom node type
    position: { x: (index % 5) * 250, y: Math.floor(index / 5) * 200 }, // Simple initial layout
    data: node,
  }));

  const edges: Edge[] = data.dependencies.map(dep => ({
    id: `${dep.prerequisiteSkillId}-${dep.skillId}`,
    source: dep.prerequisiteSkillId,
    target: dep.skillId,
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#FF0072',
    },
    style: {
      strokeWidth: 2,
      stroke: '#FF0072',
    },
  }));

  return { nodes, edges };
};

export function SkillTreeComponent() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  useEffect(() => {
    const fetchSkillTree = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await skillsApi.getSkillTree();
        if (response.isSuccess && response.data) {
          const { nodes: flowNodes, edges: flowEdges } = convertApiDataToFlowElements(response.data);
          setNodes(flowNodes);
          setEdges(flowEdges);
        } else {
          throw new Error('Failed to fetch skill tree data.');
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkillTree();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-lg bg-black/20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-lg bg-red-900/20 text-red-300">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ height: '80vh', width: '100%' }} className="rounded-lg overflow-hidden border border-accent/20">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
    </div>
  );
}