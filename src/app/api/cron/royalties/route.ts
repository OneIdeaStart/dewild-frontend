// src/app/api/cron/royalties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkAndRunDistribution } from '@/scripts/royalty-distributor';

// Предотвращает превращение функции в Edge Function
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Добавляем базовую защиту с помощью секретного ключа
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('cron_key');
    
    if (key !== process.env.CRON_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Запускаем проверку и распределение роялти
    const result = await checkAndRunDistribution();
    
    // Логируем результат
    console.log('Cron job result:', result);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result: result
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to check royalty distribution',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}