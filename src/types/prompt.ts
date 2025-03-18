// src/types/prompt.ts

// Possible prompt statuses
export type PromptStatus = 'available' | 'assigned' | 'used';

// Prompt structure in Redis
export interface PromptData extends Record<string, unknown> {
  text: string;
  status: PromptStatus;
  assignedTo?: string;    // wallet of artist
  assignedAt?: string;    // when assigned
  usedAt?: string;        // when used
}

// Types for sets in Redis
export type PromptSet = Set<string>;  // Set of prompt IDs

// Redis keys for prompts
export const PROMPT_KEYS = {
  ALL: 'prompts:all',
  AVAILABLE: 'prompts:available',
  ASSIGNED: 'prompts:assigned',
  USED: 'prompts:used',
  // Function to get status key for specific prompt
  getStatusKey: (promptId: string) => `prompts:status:${promptId}`
} as const;