// Mock data for the community guilds.
import type { Community } from "@/lib/types";

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