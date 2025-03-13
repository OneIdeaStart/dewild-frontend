// src/app/api/discord/register-commands/route.ts
import { NextResponse } from 'next/server';
import { discordCommands } from '@/lib/discord/commands';

/**
 * Эндпоинт для регистрации slash-команд Discord
 * Защищен паролем админа из переменных окружения
 */
export async function POST(request: Request) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    if (token !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }
    
    // Запрос авторизован, регистрируем команды
    const result = await discordCommands.registerCommands();
    
    return NextResponse.json({
      success: true,
      message: `${result.length} commands registered successfully`
    });
    
  } catch (error: any) {
    console.error('Error registering Discord commands:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Эндпоинт для удаления всех slash-команд Discord
 * Защищен паролем админа из переменных окружения
 */
export async function DELETE(request: Request) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    if (token !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }
    
    // Запрос авторизован, удаляем команды
    await discordCommands.deleteAllCommands();
    
    return NextResponse.json({
      success: true,
      message: 'All commands deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting Discord commands:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
}