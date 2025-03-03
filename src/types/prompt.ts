// src/types/prompt.ts

// Возможные статусы промпта
export type PromptStatus = 'available' | 'assigned' | 'used';

// Структура промпта в Redis
export interface PromptData extends Record<string, unknown> {
  text: string;
  status: PromptStatus;
  assignedTo?: string;    // wallet артиста
  assignedAt?: string;    // когда выдан
  usedAt?: string;        // когда использован
}

// Типы для сетов в Redis
export type PromptSet = Set<string>;  // Set из ID промптов

// Redis ключи для промптов
export const PROMPT_KEYS = {
  ALL: 'prompts:all',
  AVAILABLE: 'prompts:available',
  ASSIGNED: 'prompts:assigned',
  USED: 'prompts:used',
  // Функция для получения ключа статуса конкретного промпта
  getStatusKey: (promptId: string) => `prompts:status:${promptId}`
} as const;