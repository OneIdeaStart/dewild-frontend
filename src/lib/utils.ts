// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateWildRating(): string {
  const prefix = 'DW';
  
  // Генерируем 6 случайных символов (буквы и цифры)
  const randomChars = Array.from({ length: 6 }, () => 
    Math.floor(Math.random() * 36).toString(36)
  ).join('').toUpperCase();
  
  // Добавляем временную метку (последние 3 символа)
  const timestamp = Date.now().toString(36).slice(-3).toUpperCase();
  
  return `${prefix}${randomChars}${timestamp}`;
}