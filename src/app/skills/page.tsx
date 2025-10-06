// This is the new Skill Tree Interface implementation based on the provided wireframe.
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { mockSkillTree } from "@/lib/mock-data";
import { Search, Filter, BrainCircuit, Rows, BarChart, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

const tierColors = {
  foundation: 'bg-green-500',
  intermediate: 'bg-blue-500',
  advanced: 'bg-yellow-500',
  expert: 'bg-red-500',
};

const nodeStatusClasses = {
  completed: "border-green-500 bg-green-500/20 text-green-300",
  "in-progress": "border-accent animate-pulse bg-accent/20 text-accent",
  locked: "border-border/50 bg-secondary/50 text-foreground/50",
};

// A simple component to render each skill node in the graph.
function SkillNode({ node }: { node: (typeof mockSkillTree.nodes)[0] }) {
  return (
    <div
      className={`absolute w-32 h-32 rounded-full flex items-center justify-center text-center p-2 border-2 transition-all duration-300 ${nodeStatusClasses[node.status as keyof typeof nodeStatusClasses]}`}
      style={{ left: `${node.x}px`, top: `${node.y}px` }}
    >
      <span className="font-heading font-semibold">{node.label}</span>
    </div>
  );
}

// Renders the Skill Tree page, visualizing the mind map interface.
export default function SkillsPage() {
  const { nodes, edges } = mockSkillTree;

  // Calculate positions for SVG lines based on node centers.
  const edgePaths = edges.map(edge => {
    const fromNode = nodes.find(n => n.id === edge.from);
    const toNode = nodes.find(n => n.id === edge.to);
    if (!fromNode || !toNode) return null;

    // Center of node is position + half of size (128/2=64)
    return {
      id: `${edge.from}-${edge.to}`,
      x1: fromNode.x + 64,
      y1: fromNode.y + 64,
      x2: toNode.x + 64,
      y2: toNode.y + 64,
    };
  }).filter(Boolean);

  return (
    <DashboardLayout>
      <main className="col-span-12 lg:col-span-10 flex flex-col gap-6">
        <div className="text-sm text-foreground/60 font-body">
          RogueLearn &gt; Skill Tree
        </div>

        <Card className="bg-card/50">
          <CardContent className="p-6">
            {/* Control Bar */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
                  <Input placeholder="Search skills..." className="pl-10" />
                </div>
                <Button variant="outline"><Filter className="mr-2" /> Filter by Tier</Button>
                <Button variant="ghost"><BrainCircuit className="mr-2" /> Full-Stack Path</Button>
                <Button variant="ghost"><RotateCcw className="mr-2" /> Reset View</Button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm"><ZoomOut /></Button>
                  <Button variant="ghost" size="sm"><ZoomIn /></Button>
                  <span>Zoom Controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm"><BrainCircuit /></Button>
                  <Button variant="ghost" size="sm"><Rows /></Button>
                  <Button variant="ghost" size="sm"><BarChart /></Button>
                  <span>[Domain View] [Hierarchy View] [Progress View]</span>
                </div>
              </div>
            </div>

            <hr className="my-6 border-border/50" />

            {/* Tier Legend */}
            <div className="space-y-2">
              <h4 className="font-heading text-sm font-semibold">TIER LEGEND</h4>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-body">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${tierColors.foundation}`}></span>
                  <span>Foundation (L1-25)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${tierColors.intermediate}`}></span>
                  <span>Intermediate (L26-50)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${tierColors.advanced}`}></span>
                  <span>Advanced (L51-75)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${tierColors.expert}`}></span>
                  <span>Expert (L76-100)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Graph Area */}
        <Card className="bg-card/50 flex-grow relative h-[500px] p-6">
          <div className="relative w-full h-full">
            {/* Note: This is a static visualization. A real implementation would use a library like react-flow. */}
            <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                </marker>
              </defs>
              {edgePaths.map(path => (
                path && <line key={path.id} x1={path.x1} y1={path.y1} x2={path.x2} y2={path.y2} stroke="#4b5563" strokeWidth="2" markerEnd="url(#arrowhead)" />
              ))}
            </svg>
            <div className="relative w-full h-full">
              {nodes.map(node => (
                <SkillNode key={node.id} node={node} />
              ))}
            </div>
          </div>
        </Card>

        {/* Connection & Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-card/50">
            <CardContent className="p-6">
              <h4 className="font-heading text-sm font-semibold mb-2">CONNECTION TYPES:</h4>
              <ul className="space-y-2 text-sm font-body text-foreground/80">
                <li><strong className="text-foreground">Direct Prerequisite:</strong> Academic requirement</li>
                <li><strong className="text-foreground">Logical Dependency:</strong> Recommended sequence</li>
                <li><strong className="text-foreground">Domain Relationship:</strong> Related skills</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-6">
              <h4 className="font-heading text-sm font-semibold mb-2">PROGRESS OVERVIEW</h4>
              <div className="space-y-2 text-sm font-body">
                <div className="flex items-center gap-2">
                  <span className="w-40">Foundation: 8/12 skills</span>
                  <Progress value={67} className="flex-grow h-2" />
                  <span>67%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-40">Intermediate: 1/8 skills</span>
                  <Progress value={12} className="flex-grow h-2" />
                  <span>12%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-40">Advanced: 0/6 skills</span>
                  <Progress value={0} className="flex-grow h-2" />
                  <span>0%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-40">Expert: 0/4 skills</span>
                  <Progress value={0} className="flex-grow h-2" />
                  <span>0%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <p className="text-center text-sm font-body text-foreground/70">💡 Click any node for details and learning paths</p>
      </main>
    </DashboardLayout>
  );
}
