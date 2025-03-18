import 'dotenv/config'  // Add at beginning of file
import { Redis } from '@upstash/redis'
import fs from 'fs'
import path from 'path'
import { PromptData, PROMPT_KEYS } from '../types/prompt'

// Check for necessary variables
if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
  throw new Error('Missing required environment variables: KV_REST_API_URL or KV_REST_API_TOKEN')
}

// Create Redis instance
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN
})

async function importPrompts() {
  try {
    console.log('Starting prompts import...')

    // Read prompts from file
    const promptsFile = path.join(process.cwd(), 'data', 'only_prompts.json')
    const prompts: string[] = JSON.parse(fs.readFileSync(promptsFile, 'utf-8'))

    console.log(`Read ${prompts.length} prompts from file`)

    // Create pipeline for batch loading
    const pipeline = redis.pipeline()
    
    // Clear old data if exists
    console.log('Clearing old data...')
    pipeline.del(PROMPT_KEYS.ALL)
    pipeline.del(PROMPT_KEYS.AVAILABLE)
    pipeline.del(PROMPT_KEYS.ASSIGNED)
    pipeline.del(PROMPT_KEYS.USED)

    console.log('Importing prompts...')
    // Load prompts
    prompts.forEach((promptText: string, index: number) => {
      const promptId = `prompt:${index + 1}`
      
      // Save prompt text
      const promptData: PromptData = {
        text: promptText,
        status: 'available',
        createdAt: new Date().toISOString()
      }
      
      pipeline.hset(PROMPT_KEYS.getStatusKey(promptId), promptData)

      // Add to sets
      pipeline.sadd(PROMPT_KEYS.ALL, promptId)
      pipeline.sadd(PROMPT_KEYS.AVAILABLE, promptId)
    })

    // Execute all commands
    console.log('Executing Redis commands...')
    await pipeline.exec()

    // Check number of loaded prompts
    const totalCount = await redis.scard(PROMPT_KEYS.ALL)
    const availableCount = await redis.scard(PROMPT_KEYS.AVAILABLE)
    
    console.log('\nImport completed successfully!')
    console.log('--------------------------------')
    console.log(`Total prompts: ${totalCount}`)
    console.log(`Available prompts: ${availableCount}`)

  } catch (error) {
    console.error('Error importing prompts:', error)
  }
}

// Start import
importPrompts()