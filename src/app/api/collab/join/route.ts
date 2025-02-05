import { DB } from '@/lib/db';
import { CollabError } from '@/types/collab';

export async function POST(request: Request) {
  try {
    const { wallet, twitter, discord } = await request.json();

    // Валидация полей
    if (!wallet || !twitter || !discord) {
      return Response.json(
        { error: { type: 'validation', message: 'Missing required fields' }},
        { status: 400 }
      );
    }

    // Проверяем лимит
    const stats = await DB.getStats();
    if (stats.isFull) {
      return Response.json(
        { error: { type: 'limit', message: 'Collaboration list is full' }},
        { status: 403 }
      );
    }

    try {
      // Создаем заявку
      const application = await DB.createApplication(
        wallet,
        twitter,
        discord
      );

      return Response.json({ 
        success: true,
        application,
        stats: await DB.getStats()
      });
    } catch (error: any) {
      // Обрабатываем ошибки дублирования
      if (error.message.includes('already has application')) {
        return Response.json(
          { 
            error: { 
              type: 'duplicate', 
              message: error.message 
            }
          },
          { status: 400 }
        );
      }

      throw error;
    }

  } catch (error) {
    console.error('Submit error:', error);
    return Response.json(
      { error: { type: 'server', message: 'Failed to submit application' }},
      { status: 500 }
    );
  }
}