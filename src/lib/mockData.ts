// roguelearn-web/src/lib/mockData.ts
// Centralized mock data to simulate the entire application state.

// Define and export shared interfaces for mock data to ensure type safety and consistency.
export interface Member {
  id: string;
  name: string;
  status: 'online' | 'idle' | 'offline';
}

export interface ChatMessage {
  id: string;
  userId: string;
  name: string;
  message: string;
}

// Define the structure for a Guild to be used within the mockCommunity object.
interface Guild {
  id: string;
  name: string;
  description: string;
  members: number;
  activeEvents: number;
  isVerified: boolean;
  createdAt: string;
  membersList: Member[];
  chatMessages: ChatMessage[];
}

// Define the structure for the Community object.
interface Community {
  guilds: Guild[];
}

// User data, simulating the response from a User Service.
export const mockUser = {
  username: "Aetherius",
  level: 5,
  title: "Scribe",
  xp: 750,
  xpMax: 1000,
  stats: {
    class: "Full-Stack Developer",
    curriculum: "Computer Science",
    intellect: 12,
    wisdom: 14
  }
};

// Quest and event data, simulating the response from a Quests Service.
export const mockQuests = {
  active: [
    {
      id: "quest-123",
      title: "The Fundamentals of Alchemy",
      description: "Master the core principles of transformation and transmutation. Collect the five rare herbs of knowledge to proceed.",
      status: "Active",
      progress: {
        chaptersRead: 3,
        chaptersTotal: 5,
        timeSpentHours: 2.5,
        xp: 150,
        masteryPercent: 50
      },
      modules: [
        { id: 'module-1', title: 'Module 1: The Three Primes', description: 'Understand the core principles of Salt, Sulphur, and Mercury.', completed: true },
        { id: 'module-2', title: 'Module 2: Elemental Essences', description: 'Learn the properties of Fire, Water, Earth, and Air.', completed: true },
        { id: 'module-3', title: 'Module 3: Transmutation Basics', description: 'Explore the theory behind transforming one substance into another.', completed: false },
      ]
    }
  ],
  completed: [],
  available: [],
  upcomingEvents: [
    { id: "event-1", type: "Exam", title: "Data Structures", dueDate: "in 3 days" },
    { id: "event-2", type: "Assignment", title: "Algorithm Analysis", dueDate: "due in 5 days" }
  ]
};

// Skill tree data, simulating the response from a Quests or Skills Service.
export const mockSkillTree = {
  title: "The Art of Alchemy",
  nodes: [
    { id: 1, label: "The Three Primes", x: 200, y: 100 },
    { id: 2, label: "Elemental Essences", x: 200, y: 200 },
    { id: 3, label: "Transmutation Basics", x: 200, y: 300 },
  ],
  edges: [
    { from: 1, to: 2 },
    { from: 2, to: 3 },
  ]
};

// Arsenal data, simulating notes from a Quests or Notes Service.
export const mockArsenal = [
  { id: 'note-1', title: 'On the Transmutation of Lead', description: 'The core principle lies in the manipulation of elemental essences through careful observation and methodical practice.', tags: ['Alchemy', 'Core Concepts'] },
  { id: 'note-2', title: 'The Binding of Ancient Scripts', description: 'When transcribing the old texts, one must remember that each symbol carries not just meaning, but intent...', tags: ['Scribing', 'Ancient Texts', 'Theory'] },
  { id: 'note-3', title: 'Fundamentals of Mystical Mathematics', description: 'The numerical patterns found in nature reveal themselves through careful study and pattern calculation...', tags: ['Mathematics', 'Patterns'] },
];

// Community data, simulating responses from a Social Service.
// The data object is now strongly typed with the 'Community' interface, removing the need for type assertions.
export const mockCommunity: Community = {
  guilds: [
    { 
      id: 'guild-1', 
      name: "The Alchemist's Circle", 
      description: 'A guild dedicated to the deepest mysteries of alchemy and elemental transformation.', 
      members: 128, 
      activeEvents: 2, 
      isVerified: true,
      createdAt: 'Sep, 2025 Rank 2265',
      membersList: [
        { id: 'user-1', name: 'Aetherius', status: 'online' },
        { id: 'user-2', name: 'Luna', status: 'online' },
        { id: 'user-3', name: 'Vixxy', status: 'idle' },
        { id: 'user-4', name: 'Morgana', status: 'offline' },
        { id: 'user-5', name: 'Zephyr', status: 'offline' },
      ],
      chatMessages: [
        { id: 'msg-1', userId: 'user-2', name: 'Luna', message: 'Has anyone reviewed the latest chapter on elemental binding?' },
        { id: 'msg-2', userId: 'user-1', name: 'Aetherius', message: 'I have. The section on aetheric resonance is particularly fascinating.' },
        { id: 'msg-3', userId: 'user-3', name: 'Vixxy', message: 'I\'m still working through the prerequisites. Can anyone help with the transmutation symbols?' },
      ]
    },
    { 
      id: 'guild-2', 
      name: "Beginner's Study Hall", 
      description: 'A friendly and welcoming place for new scribes to ask questions and find study partners.', 
      members: 42, 
      activeEvents: 0, 
      isVerified: false,
      createdAt: 'Oct, 2025 Rank 2265',
      membersList: [],
      chatMessages: []
    },
  ]
};