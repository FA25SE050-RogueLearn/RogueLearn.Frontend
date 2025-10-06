// Mock data for the skill tree, updated with positions and status for visualization.

export const mockSkillTree = {
  title: "The Art of Alchemy",
  nodes: [
    { id: 'programming', label: 'Programming', x: 350, y: 150, status: 'in-progress' },
    { id: 'arrays', label: 'Arrays', x: 150, y: 50, status: 'completed' },
    { id: 'variables', label: 'Variables', x: 550, y: 50, status: 'completed' },
    { id: 'functions', label: 'Functions', x: 550, y: 250, status: 'in-progress' },
    { id: 'objects', label: 'Objects', x: 150, y: 250, status: 'locked' },
  ],
  edges: [
    { from: 'arrays', to: 'programming' },
    { from: 'variables', to: 'programming' },
    { from: 'programming', to: 'functions' },
    { from: 'programming', to: 'objects' },
  ]
};
