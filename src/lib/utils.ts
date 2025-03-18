// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateWildRating(): string {
  const prefix = 'DW';
  
  // Generate 6 random characters (letters and numbers)
  const randomChars = Array.from({ length: 6 }, () => 
    Math.floor(Math.random() * 36).toString(36)
  ).join('').toUpperCase();
  
  // Add timestamp (last 3 characters)
  const timestamp = Date.now().toString(36).slice(-3).toUpperCase();
  
  return `${prefix}${randomChars}${timestamp}`;
}