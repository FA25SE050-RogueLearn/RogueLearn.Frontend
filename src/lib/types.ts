// This file centralizes shared type definitions used across the application.

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

// Defines the structure for a Guild to be used within the mockCommunity object.
export interface Guild {
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

// Defines the structure for the Community object.
export interface Community {
  guilds: Guild[];
}