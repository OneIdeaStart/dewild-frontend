import fs from 'fs'
import path from 'path'
import { CollabEntry, CollabError } from '@/types/collab'

interface CollabData {
  entries: CollabEntry[];
  stats: {
    totalCount: number;
    lastUpdated: string;
  }
}

const COLLAB_PATH = path.join(process.cwd(), 'data/collab.json')

const ensureCollabFile = () => {
  if (!fs.existsSync(COLLAB_PATH)) {
    fs.mkdirSync(path.dirname(COLLAB_PATH), { recursive: true })
    const initialData: CollabData = {
      entries: [],
      stats: {
        totalCount: 0,
        lastUpdated: new Date().toISOString()
      }
    }
    fs.writeFileSync(COLLAB_PATH, JSON.stringify(initialData, null, 2))
  }
}

export const readCollabList = (): CollabData => {
  ensureCollabFile()
  try {
    const data = fs.readFileSync(COLLAB_PATH, 'utf-8')
    const parsed = JSON.parse(data)
    
    const entries: CollabEntry[] = Array.isArray(parsed.entries) ? parsed.entries : [];
    
    return {
      entries: entries,
      stats: {
        totalCount: entries.length,
        lastUpdated: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Error reading collab list:', error)
    return {
      entries: [],
      stats: {
        totalCount: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }
}

const checkUnique = (entry: CollabEntry): CollabError | null => {
  try {
    const { entries } = readCollabList()
    
    if (!Array.isArray(entries)) {
      throw new Error('Invalid collab list format')
    }

    const addressExists = entries.some(e => {
      if (!e.w || !entry.w) return false;
      return e.w.toLowerCase() === entry.w.toLowerCase()
    })
    
    if (addressExists) {
      return { type: 'address', message: 'This address has already applied' }
    }
    
    if (entries.some(e => e.d === entry.d)) {
      return { type: 'discord', message: 'This Discord account has already applied' }
    }
    
    if (entries.some(e => {
      if (!e.t || !entry.t) return false;
      return e.t.toLowerCase() === entry.t.toLowerCase()
    })) {
      return { type: 'twitter', message: 'This Twitter handle has already applied' }
    }
    
    return null
  } catch (error) {
    console.error('Check unique error:', error)
    return { type: 'address', message: 'Error checking collab list' }
  }
}

export const checkCollabEntries = (params: {
  address?: string,
  discord?: string,
  twitter?: string
}) => {
  // ... остальной код тот же, заменить whitelist на collab в сообщениях
}

export const addToCollabList = async (entry: {
  address: string,
  discord: string,
  twitter: string
}) => {
  // ... остальной код тот же, заменить whitelist на collab в сообщениях
}

export const clearCollabList = () => {
  const emptyData: CollabData = {
    entries: [],
    stats: {
      totalCount: 0,
      lastUpdated: new Date().toISOString()
    }
  }
  fs.writeFileSync(COLLAB_PATH, JSON.stringify(emptyData, null, 2))
}

export const getCollabEntries = () => {
  const { entries } = readCollabList()
  return entries
}