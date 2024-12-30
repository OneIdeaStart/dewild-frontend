// src/types/mint-stages.ts
export enum MintStage {
    WHITELIST_REGISTRATION = 'WHITELIST_REGISTRATION',  // Сбор вайтлиста
    FREE_MINT = 'FREE_MINT',                           // Бесплатный минт
    EARLY_ADOPTERS = 'EARLY_ADOPTERS',                 // Ранний минт
    EARLY_ADOPTERS_PUBLIC = 'EARLY_ADOPTERS_PUBLIC',   // Публичный ранний минт
    FIXED_PRICE = 'FIXED_PRICE',                       // Фиксированная цена
    FINAL_AUCTION = 'FINAL_AUCTION',                   // Финальный аукцион
    SOLD_OUT = 'SOLD_OUT'                             // Всё продано
  }
  
  export interface StageConfig {
    title: string;
    description: string;
    price: string;
    buttonText: string;
    isWhitelistOnly: boolean;
    duration?: number; // в секундах
  }