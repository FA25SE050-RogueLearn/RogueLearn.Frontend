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
      id: "quest-dsa",
      title: "Data Structures & Algorithms",
      subtitle: "Chapter 1: Semester 1",
      description: "Master the fundamental data structures and algorithms. Build a strong foundation for advanced programming concepts.",
      status: "Active",
      difficulty: "Intermediate",
      estimatedHours: 45,
      xpReward: 2450,
      progress: {
        chaptersCompleted: 3,
        chaptersTotal: 10,
        timeSpentHours: 12.5,
        currentXP: 750,
        totalXP: 2450,
        masteryPercent: 30
      },
      chapters: [
        { 
          id: 'dsa-ch-1', 
          questId: 'quest-dsa',
          chapterNumber: 1,
          title: 'Arrays & Basic Operations', 
          description: 'Learn array fundamentals, indexing, and basic operations.',
          estimatedHours: 3,
          xpReward: 200,
          status: 'completed' as 'completed',
          modules: [
            { id: 'mod-1-1', title: 'Introduction to Arrays', duration: '30min', completed: true },
            { id: 'mod-1-2', title: 'Array Indexing & Access', duration: '45min', completed: true },
            { id: 'mod-1-3', title: 'Array Traversal', duration: '1h', completed: true },
          ]
        },
        { 
          id: 'dsa-ch-2', 
          questId: 'quest-dsa',
          chapterNumber: 2,
          title: 'Searching Algorithms', 
          description: 'Master linear and binary search techniques.',
          estimatedHours: 4,
          xpReward: 250,
          status: 'completed' as 'completed',
          modules: [
            { id: 'mod-2-1', title: 'Linear Search', duration: '1h', completed: true },
            { id: 'mod-2-2', title: 'Binary Search', duration: '1.5h', completed: true },
            { id: 'mod-2-3', title: 'Search Optimization', duration: '1h', completed: true },
          ]
        },
        { 
          id: 'dsa-ch-3', 
          questId: 'quest-dsa',
          chapterNumber: 3,
          title: 'Sorting Algorithms', 
          description: 'Understand bubble sort, selection sort, and insertion sort.',
          estimatedHours: 5,
          xpReward: 300,
          status: 'current' as 'current',
          modules: [
            { id: 'mod-3-1', title: 'Bubble Sort', duration: '1h', completed: true },
            { id: 'mod-3-2', title: 'Selection Sort', duration: '1h', completed: false },
            { id: 'mod-3-3', title: 'Insertion Sort', duration: '1.5h', completed: false },
          ]
        },
        { id: 'dsa-ch-4', questId: 'quest-dsa', chapterNumber: 4, title: 'Linked Lists', description: 'Single and double linked lists implementation.', estimatedHours: 5, xpReward: 300, status: 'locked' as 'locked' },
        { id: 'dsa-ch-5', questId: 'quest-dsa', chapterNumber: 5, title: 'Stacks & Queues', description: 'LIFO and FIFO data structures.', estimatedHours: 4, xpReward: 250, status: 'locked' as 'locked' },
        { id: 'dsa-ch-6', questId: 'quest-dsa', chapterNumber: 6, title: 'Trees & Binary Search Trees', description: 'Hierarchical data structures and tree traversal.', estimatedHours: 6, xpReward: 350, status: 'locked' as 'locked' },
        { id: 'dsa-ch-7', questId: 'quest-dsa', chapterNumber: 7, title: 'Heaps & Priority Queues', description: 'Advanced heap operations and applications.', estimatedHours: 5, xpReward: 300, status: 'locked' as 'locked' },
        { id: 'dsa-ch-8', questId: 'quest-dsa', chapterNumber: 8, title: 'Graphs & Graph Algorithms', description: 'Graph representation, BFS, and DFS.', estimatedHours: 7, xpReward: 400, status: 'locked' as 'locked' },
        { id: 'dsa-ch-9', questId: 'quest-dsa', chapterNumber: 9, title: 'Dynamic Programming', description: 'Optimization techniques and memoization.', estimatedHours: 8, xpReward: 450, status: 'locked' as 'locked' },
        { id: 'dsa-ch-10', questId: 'quest-dsa', chapterNumber: 10, title: 'Advanced Algorithms', description: 'Greedy algorithms, divide and conquer.', estimatedHours: 8, xpReward: 450, status: 'locked' as 'locked' },
      ]
    },
    {
      id: "quest-web-dev",
      title: "Web Development Fundamentals",
      subtitle: "Chapter 1: Frontend Basics",
      description: "Learn the essential building blocks of modern web development, from HTML to advanced CSS frameworks.",
      status: "Active",
      difficulty: "Beginner",
      estimatedHours: 35,
      xpReward: 1800,
      progress: {
        chaptersCompleted: 1,
        chaptersTotal: 8,
        timeSpentHours: 5,
        currentXP: 200,
        totalXP: 1800,
        masteryPercent: 12
      },
      chapters: [
        { 
          id: 'web-ch-1', 
          questId: 'quest-web-dev',
          chapterNumber: 1,
          title: 'HTML Basics', 
          description: 'Structure web pages with semantic HTML.',
          estimatedHours: 4,
          xpReward: 200,
          status: 'completed' as 'completed',
          modules: [
            { id: 'web-mod-1-1', title: 'HTML Elements', duration: '1h', completed: true },
            { id: 'web-mod-1-2', title: 'Forms & Input', duration: '1.5h', completed: true },
            { id: 'web-mod-1-3', title: 'Semantic HTML', duration: '1h', completed: true },
          ]
        },
        { 
          id: 'web-ch-2', 
          questId: 'quest-web-dev',
          chapterNumber: 2,
          title: 'CSS Fundamentals', 
          description: 'Style your web pages with modern CSS.',
          estimatedHours: 5,
          xpReward: 250,
          status: 'current' as 'current',
          modules: [
            { id: 'web-mod-2-1', title: 'CSS Selectors', duration: '1h', completed: false },
            { id: 'web-mod-2-2', title: 'Box Model', duration: '1.5h', completed: false },
            { id: 'web-mod-2-3', title: 'Flexbox', duration: '2h', completed: false },
          ]
        },
        { id: 'web-ch-3', questId: 'quest-web-dev', chapterNumber: 3, title: 'Responsive Design', description: 'Create mobile-first responsive layouts.', estimatedHours: 4, xpReward: 225, status: 'locked' as 'locked' },
        { id: 'web-ch-4', questId: 'quest-web-dev', chapterNumber: 4, title: 'JavaScript Basics', description: 'Add interactivity with JavaScript.', estimatedHours: 6, xpReward: 300, status: 'locked' as 'locked' },
        { id: 'web-ch-5', questId: 'quest-web-dev', chapterNumber: 5, title: 'DOM Manipulation', description: 'Control web page elements dynamically.', estimatedHours: 5, xpReward: 275, status: 'locked' as 'locked' },
        { id: 'web-ch-6', questId: 'quest-web-dev', chapterNumber: 6, title: 'ES6+ Features', description: 'Modern JavaScript syntax and features.', estimatedHours: 5, xpReward: 275, status: 'locked' as 'locked' },
        { id: 'web-ch-7', questId: 'quest-web-dev', chapterNumber: 7, title: 'Async JavaScript', description: 'Promises, async/await, and fetch API.', estimatedHours: 6, xpReward: 300, status: 'locked' as 'locked' },
        { id: 'web-ch-8', questId: 'quest-web-dev', chapterNumber: 8, title: 'Web APIs', description: 'LocalStorage, Geolocation, and more.', estimatedHours: 5, xpReward: 275, status: 'locked' as 'locked' },
      ]
    },
  ],
  completed: [
    {
      id: "quest-prog-basics",
      title: "Programming Basics",
      subtitle: "Chapter 1: Introduction",
      description: "Your first steps into the world of programming. Variables, loops, and functions.",
      status: "Completed",
      difficulty: "Beginner",
      estimatedHours: 20,
      xpReward: 1000,
      completedAt: "2025-09-15",
      progress: {
        chaptersCompleted: 5,
        chaptersTotal: 5,
        timeSpentHours: 18,
        currentXP: 1000,
        totalXP: 1000,
        masteryPercent: 100
      },
      chapters: []
    }
  ],
  available: [
    {
      id: "quest-databases",
      title: "Database Design",
      subtitle: "Chapter 1: Relational Databases",
      description: "Master SQL and database design principles. Learn to structure and query data efficiently.",
      status: "Available",
      difficulty: "Intermediate",
      estimatedHours: 40,
      xpReward: 2200,
      prerequisites: ["quest-dsa"],
      progress: {
        chaptersCompleted: 0,
        chaptersTotal: 8,
        timeSpentHours: 0,
        currentXP: 0,
        totalXP: 2200,
        masteryPercent: 0
      },
      chapters: []
    },
    {
      id: "quest-oop",
      title: "Object-Oriented Programming",
      subtitle: "Chapter 1: OOP Concepts",
      description: "Learn the pillars of OOP: encapsulation, inheritance, polymorphism, and abstraction.",
      status: "Available",
      difficulty: "Intermediate",
      estimatedHours: 30,
      xpReward: 1600,
      prerequisites: ["quest-prog-basics"],
      progress: {
        chaptersCompleted: 0,
        chaptersTotal: 6,
        timeSpentHours: 0,
        currentXP: 0,
        totalXP: 1600,
        masteryPercent: 0
      },
      chapters: []
    }
  ],
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