// src/app/api/discord/webhook/route.ts
import { NextResponse } from 'next/server';

// Проверка подписи Discord для защиты вебхука
function verifyDiscordSignature(request: Request): boolean {
  // В реальном приложении здесь должна быть проверка X-Signature-Ed25519 и X-Signature-Timestamp
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
    
    // Обрабатываем только PING запросы для проверки соединения
    if (data.type === 1) {
      return NextResponse.json({ type: 1 });
    }
    
    // Для всех остальных запросов возвращаем стандартный ответ
    return NextResponse.json({
      type: 4,
      data: {
        content: "Commands are temporarily disabled. Please check the dashboard at https://dewild.club/dashboard for updates.",
        flags: 64 // Эфемерное сообщение (видно только отправителю)
      }
    });
  } catch (error) {
    console.error('Error in Discord webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}