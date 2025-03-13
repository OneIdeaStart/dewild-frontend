// src/app/api/discord/webhook/route.ts
import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { DiscordDB } from '@/lib/db/discord';
import { discordService } from '@/lib/discord';

// Проверка подписи Discord для защиты вебхука
function verifyDiscordSignature(request: Request): boolean {
  // В реальном приложении здесь должна быть проверка X-Signature-Ed25519 и X-Signature-Timestamp
  // Подробнее: https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization
  
  // Упрощённая реализация для MVP
  const signature = request.headers.get('X-Signature-Ed25519');
  const timestamp = request.headers.get('X-Signature-Timestamp');
  
  // В реальной реализации здесь должна быть проверка подписи
  return true;
}

export async function POST(request: Request) {
  try {
    // Проверяем подпись запроса от Discord
    if (!verifyDiscordSignature(request)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    // Парсим данные запроса
    const data = await request.json();
    
    // Обрабатываем различные типы событий
    switch (data.type) {
      // Тип 1 - PING для проверки подключения
      case 1:
        return NextResponse.json({ type: 1 });
      
      // Тип 2 - APPLICATION_COMMAND (slash-команды)
      case 2:
        return handleInteraction(data);
      
      // Тип 3 - MESSAGE_COMPONENT (взаимодействие с компонентами сообщений)
      case 3:
        return handleComponentInteraction(data);
    }
    
    return NextResponse.json({});
  } catch (error) {
    console.error('Error in Discord webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Обработка команд и взаимодействий в Discord
 */
async function handleInteraction(data: any) {
  const { channel_id, guild_id, member, data: interactionData } = data;
  
  // Получаем ID заявки по ID канала
  const applicationId = await DiscordDB.getChannelApplication(channel_id);
  if (!applicationId) {
    return NextResponse.json({
      type: 4,
      data: {
        content: 'Error: This channel is not linked to any application.',
        flags: 64 // Эфемерное сообщение (видно только отправителю)
      }
    });
  }
  
  // Получаем заявку из базы данных
  const application = await DB.getApplicationById(applicationId);
  if (!application) {
    return NextResponse.json({
      type: 4,
      data: {
        content: 'Error: Application not found.',
        flags: 64 // Эфемерное сообщение
      }
    });
  }
  
  // Обрабатываем различные команды
  switch (interactionData.name) {
    case 'status':
      // Команда для просмотра текущего статуса заявки
      return NextResponse.json({
        type: 4,
        data: {
          content: `Current status: **${application.status}**`
        }
      });
    
    case 'help':
      // Команда для получения справки
      return NextResponse.json({
        type: 4,
        data: {
          content: 'Available commands:\n' +
                   '`/status` - Check your application status\n' +
                   '`/help` - Show this help message'
        }
      });
  }
  
  return NextResponse.json({
    type: 4,
    data: {
      content: 'Unknown command. Try `/help` for available commands.',
      flags: 64 // Эфемерное сообщение
    }
  });
}

/**
 * Обработка взаимодействий с компонентами сообщений
 */
async function handleComponentInteraction(data: any) {
  const { channel_id, guild_id, member, data: componentData } = data;
  
  // Получаем ID заявки по ID канала
  const applicationId = await DiscordDB.getChannelApplication(channel_id);
  if (!applicationId) {
    return NextResponse.json({
      type: 4,
      data: {
        content: 'Error: This channel is not linked to any application.',
        flags: 64 // Эфемерное сообщение
      }
    });
  }
  
  // Получаем заявку из базы данных
  const application = await DB.getApplicationById(applicationId);
  if (!application) {
    return NextResponse.json({
      type: 4,
      data: {
        content: 'Error: Application not found.',
        flags: 64 // Эфемерное сообщение
      }
    });
  }
  
  // Обрабатываем кнопки и другие компоненты
  // Идентификатор custom_id содержит информацию о действии
  const [action, ...params] = componentData.custom_id.split(':');
  
  switch (action) {
    case 'refresh':
      // Обновить информацию о заявке
      await discordService.updateApplicationStatusMessage(channel_id, application);
      return NextResponse.json({
        type: 6, // Ответ типа 6 означает "обновление скрыто"
      });
      
    case 'visit':
      // Переход на дашборд
      return NextResponse.json({
        type: 4,
        data: {
          content: 'Visit your dashboard at https://dewild.club/dashboard',
          flags: 64 // Эфемерное сообщение
        }
      });
  }
  
  return NextResponse.json({
    type: 4,
    data: {
      content: 'Unknown action.',
      flags: 64 // Эфемерное сообщение
    }
  });
}