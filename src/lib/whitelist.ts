// src/lib/whitelist.ts
import fs from 'fs'
import path from 'path'
import { WhitelistEntry, WhitelistError } from '@/types/whitelist'

interface WhitelistData {
 entries: WhitelistEntry[];
 stats: {
   totalCount: number;
   lastUpdated: string;
 }
}

const WHITELIST_PATH = path.join(process.cwd(), 'data/whitelist.json')

// Проверка существования и создание файла если нужно
const ensureWhitelistFile = () => {
 if (!fs.existsSync(WHITELIST_PATH)) {
   fs.mkdirSync(path.dirname(WHITELIST_PATH), { recursive: true })
   const initialData: WhitelistData = {
     entries: [],
     stats: {
       totalCount: 0,
       lastUpdated: new Date().toISOString()
     }
   }
   fs.writeFileSync(WHITELIST_PATH, JSON.stringify(initialData, null, 2))
 }
}

// Чтение вайтлиста
export const readWhitelist = (): WhitelistData => {
  ensureWhitelistFile()
  try {
    const data = fs.readFileSync(WHITELIST_PATH, 'utf-8')
    const parsed = JSON.parse(data)
    
    // Добавляем типизацию для entries
    const entries: WhitelistEntry[] = Array.isArray(parsed.entries) ? parsed.entries : [];
    
    return {
      entries: entries,
      stats: {
        totalCount: entries.length,
        lastUpdated: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error reading whitelist:', error)
    return {
      entries: [],
      stats: {
        totalCount: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }
}

// Проверка уникальности данных
const checkUnique = (entry: WhitelistEntry): WhitelistError | null => {
  try {
    const { entries } = readWhitelist()
    
    if (!Array.isArray(entries)) {
      throw new Error('Invalid whitelist format')
    }

    const addressExists = entries.some(e => {
      if (!e.address || !entry.address) return false;
      const matches = e.address.toLowerCase() === entry.address.toLowerCase()
      return matches
    })
    
    if (addressExists) {
      return { type: 'address', message: 'This address is already whitelisted' }
    }
    
    if (entries.some(e => e.discord === entry.discord)) {
      return { type: 'discord', message: 'This Discord account is already used' }
    }
    
    if (entries.some(e => {
      if (!e.twitter || !entry.twitter) return false;
      return e.twitter.toLowerCase() === entry.twitter.toLowerCase()
    })) {
      return { type: 'twitter', message: 'This Twitter handle is already used' }
    }
    
    return null
  } catch (error) {
    console.error('Check unique error:', error)
    return { type: 'address', message: 'Error checking whitelist' }
  }
}

// Проверка существования записей
export const checkWhitelistEntries = (params: {
  address?: string,
  discord?: string,
  twitter?: string
}) => {
  try {
    const { entries } = readWhitelist()
    
    if (!Array.isArray(entries)) {
      throw new Error('Invalid whitelist format')
    }

    return {
      address: params.address ? entries.some(e => e.address.toLowerCase() === params.address?.toLowerCase()) : false,
      discord: params.discord ? entries.some(e => e.discord === params.discord) : false,  // Обновили проверку Discord
      twitter: params.twitter ? entries.some(e => e.twitter.toLowerCase() === params.twitter?.toLowerCase()) : false
    }
  } catch (error) {
    console.error('Check entries error:', error)
    return {
      address: false,
      discord: false,
      twitter: false
    }
  }
}

// Добавление в вайтлист
export const addToWhitelist = async (entry: WhitelistEntry) => {
    try {
        const data = await fs.readFileSync(WHITELIST_PATH, 'utf-8');
        const whitelist = JSON.parse(data);

        const formattedEntry = {
        address: entry.address,
        discord: entry.discord,  // Теперь просто передаем строку
        twitter: entry.twitter,
        joinedAt: entry.joinedAt
        };

        whitelist.entries.push(formattedEntry);
        whitelist.stats.totalCount = whitelist.entries.length;
        whitelist.stats.lastUpdated = new Date().toISOString();

        const formattedJSON = `{
            "entries": [
            ${whitelist.entries.map((e: WhitelistEntry) => JSON.stringify(e)).join(',\n    ')}
            ],
            "stats": {
                "totalCount": ${whitelist.stats.totalCount},
                "lastUpdated": "${whitelist.stats.lastUpdated}"
            }
        }`;

    await fs.writeFileSync(WHITELIST_PATH, formattedJSON);
    return { success: true };
  } catch (error) {
    console.error('Error adding to whitelist:', error);
    return { success: false, error: { type: 'server', message: 'Failed to add to whitelist' } };
  }
};

// Очистка whitelist (только для тестирования)
export const clearWhitelist = () => {
  const emptyData: WhitelistData = {
    entries: [],
    stats: {
      totalCount: 0,
      lastUpdated: new Date().toISOString()
    }
  }
  fs.writeFileSync(WHITELIST_PATH, JSON.stringify(emptyData, null, 2))
}

// Получение текущего списка (для проверки)
export const getWhitelistEntries = () => {
  const { entries } = readWhitelist()
  return entries
}