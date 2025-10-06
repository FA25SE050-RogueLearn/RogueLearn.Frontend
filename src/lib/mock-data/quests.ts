// Mock data for quests and events.

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