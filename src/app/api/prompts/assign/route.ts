import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { PROMPT_KEYS } from '@/types/prompt';
import { Redis } from '@upstash/redis';

// Создаем Redis клиент
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!
});

export async function GET(request: Request) {
  try {
    // Получаем адрес кошелька из запроса
    const { searchParams } = new URL(request.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }

    // Проверяем существование и статус заявки
    const application = await DB.getApplicationByWallet(wallet);
    
    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    
    // Добавляем 'nft_rejected' в список разрешенных статусов
    if (application.status !== 'approved' && 
        application.status !== 'prompt_received' && 
        application.status !== 'nft_rejected') {
      return NextResponse.json({ 
        error: 'Application is not approved',
        status: application.status  
      }, { status: 403 });
    }

    // Проверяем, есть ли уже выданный промпт
    if (application.promptId) {
        console.log("Found existing promptId:", application.promptId);
        
        // Получаем существующий промпт
        const promptKey = PROMPT_KEYS.getStatusKey(application.promptId);
        console.log("Looking for prompt at key:", promptKey);
        
        const existingPrompt = await redis.hgetall(promptKey);
        console.log("Existing prompt data:", existingPrompt);
        
        if (existingPrompt && Object.keys(existingPrompt).length > 0) {
        return NextResponse.json({ 
            prompt: existingPrompt,
            isNew: false 
        });
        } else {
        console.log("Prompt not found in Redis, will assign a new one");
        }
    }

    // Получаем случайный промпт из доступных
    const promptId = await redis.srandmember(PROMPT_KEYS.AVAILABLE);
    
    if (!promptId) {
      return NextResponse.json({ error: 'No available prompts' }, { status: 500 });
    }

    // Получаем данные промпта
    const promptData = await redis.hgetall(PROMPT_KEYS.getStatusKey(String(promptId)));
    
    // Обновляем статус промпта на assigned
    await redis.srem(PROMPT_KEYS.AVAILABLE, String(promptId));
    await redis.sadd(PROMPT_KEYS.ASSIGNED, String(promptId));
    await redis.hset(PROMPT_KEYS.getStatusKey(String(promptId)), {
      status: 'assigned',
      assignedTo: wallet,
      assignedAt: new Date().toISOString()
    });

    // Обновляем заявку - меняем статус и добавляем promptId
    await DB.updateStatus(application.id, 'prompt_received');
    await DB.updateApplicationPrompt(application.id, String(promptId));

    return NextResponse.json({ 
      prompt: promptData, 
      isNew: true 
    });

  } catch (error: any) {
    console.error('Error assigning prompt:', error);
    return NextResponse.json(
      { error: 'Failed to assign prompt', details: error?.message },
      { status: 500 }
    );
  }
}