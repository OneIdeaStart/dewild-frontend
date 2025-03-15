// src/scripts/discord-migration.ts
import 'dotenv/config';
import { kv } from '@vercel/kv';
import axios from 'axios';

// Типы для базы данных
interface CollabApplication {
  id: string;
  wallet: string;
  twitter: string;
  discord: string;
  status: string;
  createdAt: string;
  discordChannelId?: string;
  moderatorVotes: Array<{
    discordId: string;
    vote: 'approve' | 'reject';
    votedAt: string;
    comment?: string;
  }>;
  promptId?: string;
  promptAssignedAt?: string;
  imageUrl?: string;
  imageUploadedAt?: string;
  mintedAt?: string;
  metadata?: any;
}

// Константы из оригинального DB класса
const DB_KEYS = {
  ALL_APPLICATIONS: 'applications:all',
  // Старые ключи для мэппинга (будут использоваться только для чтения при миграции)
  APPLICATION_CHANNEL_MAP: 'discord:application:channel',
  CHANNEL_APPLICATION_MAP: 'discord:channel:application',
};

// Константы для Discord API
const CHANNEL_TYPE_TEXT = 0;
const PERMISSION_VIEW_CHANNEL = "1024"; // (1 << 10)
const PERMISSION_SEND_MESSAGES = "2048"; // (1 << 11)
const PERMISSION_READ_MESSAGE_HISTORY = "65536"; // (1 << 16)
const PERMISSION_ADD_REACTIONS = "64"; // (1 << 6)

// Функция для получения заявки по ID
async function getApplicationById(id: string): Promise<CollabApplication | null> {
  try {
    const record = await kv.hgetall<any>(`application:${id}`);
    if (!record) return null;
    
    // Преобразуем запись из Redis в CollabApplication
    const application: CollabApplication = {
      id: record.id,
      wallet: record.wallet,
      twitter: record.twitter,
      discord: record.discord,
      status: record.status,
      createdAt: record.createdAt,
      discordChannelId: record.discordChannelId,
      moderatorVotes: record.moderatorVotes || [],
      promptId: record.promptId,
      promptAssignedAt: record.promptAssignedAt,
      imageUrl: record.imageUrl,
      imageUploadedAt: record.imageUploadedAt,
      mintedAt: record.mintedAt,
      metadata: record.metadata
    };
  
    // Если metadata строка, парсим её в объект
    if (application.metadata && typeof application.metadata === 'string') {
      try {
        application.metadata = JSON.parse(application.metadata as string);
      } catch (e) {
        // Ошибка при парсинге, но продолжаем выполнение
        console.warn('Error parsing metadata for application', id);
      }
    }
  
    return application;
  } catch (error) {
    console.error('Error getting application by ID:', error);
    return null;
  }
}

// Получение всех ID заявок
async function getAllApplicationIds(): Promise<string[]> {
  try {
    return await kv.smembers(DB_KEYS.ALL_APPLICATIONS);
  } catch (error) {
    console.error('Error getting all application IDs:', error);
    return [];
  }
}

// Обновление заявки
async function updateApplication(id: string, updates: Partial<CollabApplication>): Promise<boolean> {
  try {
    await kv.hset(`application:${id}`, updates);
    return true;
  } catch (error) {
    console.error(`Failed to update application ${id}:`, error);
    return false;
  }
}

// Получение Discord канала для заявки (из старой системы маппингов)
async function getOldApplicationChannel(applicationId: string): Promise<string | null> {
  try {
    return kv.hget<string>(DB_KEYS.APPLICATION_CHANNEL_MAP, applicationId);
  } catch (error) {
    console.error('Error getting application channel:', error);
    return null;
  }
}

// Получение Discord ID пользователя по его тегу
async function getUserIdByUsername(discordTag: string): Promise<string | null> {
  try {
    const [username, discriminator] = discordTag.split('#');
    
    // Получаем список участников сервера через API Discord
    const response = await axios.get<any[]>(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_SERVER_ID}/members?limit=1000`,
      { 
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    // Проверяем, что response.data это массив
    if (!Array.isArray(response.data)) {
      console.error('Unexpected response format from Discord API:', response.data);
      return null;
    }
    
    // Ищем пользователя по имени и дискриминатору
    const member = response.data.find((m: any) => {
      if (!m.user) return false;
      const user = m.user;
      return user.username === username && 
             (discriminator ? user.discriminator === discriminator : true);
    });
    
    return member && member.user ? member.user.id : null;
  } catch (error) {
    console.error('Failed to get Discord user ID:', error);
    return null;
  }
}

// Создание канала для заявки
async function createApplicationChannel(application: CollabApplication): Promise<string | null> {
  try {
    // Получаем Discord ID пользователя
    const userId = await getUserIdByUsername(application.discord);
    if (!userId) {
      console.error(`User ${application.discord} not found in Discord server`);
      return null;
    }

    // Создаем имя канала на основе ID заявки
    const channelName = `app-${application.id}`;

    // Настраиваем права доступа
    const permissionOverwrites = [
        {
          id: process.env.DISCORD_SERVER_ID!, // @everyone роль
          type: 0, // тип "роль"
          allow: '0',
          deny: PERMISSION_VIEW_CHANNEL // Скрываем канал от всех
        },
        {
          id: userId, // Конкретный пользователь
          type: 1, // тип "пользователь"
          allow: "68672", // VIEW_CHANNEL + SEND_MESSAGES + READ_MESSAGE_HISTORY + ADD_REACTIONS
          deny: '0'
        }
    ];

    // Добавляем роль бота, если она задана
    if (process.env.DISCORD_BOT_ROLE_ID) {
      permissionOverwrites.push({
        id: process.env.DISCORD_BOT_ROLE_ID,
        type: 0, // тип "роль"
        allow: "68672",
        deny: '0'
      });
    }

    // Добавляем самого бота, если задан CLIENT_ID
    if (process.env.DISCORD_CLIENT_ID) {
      permissionOverwrites.push({
        id: process.env.DISCORD_CLIENT_ID,
        type: 1, // тип "пользователь" для бота
        allow: "68672",
        deny: '0'
      });
    }

    // Создаем канал через API Discord
    const response = await axios.post<{ id: string }>(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_SERVER_ID}/channels`,
      {
        name: channelName,
        type: CHANNEL_TYPE_TEXT,
        parent_id: process.env.DISCORD_APPLICATIONS_CATEGORY_ID, // Категория для каналов заявок
        permission_overwrites: permissionOverwrites,
        sync_permissions: true
      },
      { 
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );

    const channelId = response.data.id;
    
    // Даем Discord время на применение настроек
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Отправляем начальное сообщение с информацией о заявке
    await sendApplicationStatusMessage(channelId, application);
    
    return channelId;
  } catch (error) {
    console.error('Failed to create application channel:', error);
    return null;
  }
}

// Отправка сообщения о статусе заявки
async function sendApplicationStatusMessage(channelId: string, application: CollabApplication): Promise<boolean> {
  try {
    // Формируем сообщение о статусе
    const message = getStatusMessage(application);
    
    // Отправляем сообщение через API Discord
    await axios.post(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      { content: message },
      { 
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error('Failed to send application status message:', error);
    return false;
  }
}

// Формирование сообщения о статусе заявки
function getStatusMessage(application: CollabApplication): string {
  const statusEmoji = getStatusEmoji(application.status);
  const created = new Date(application.createdAt).toLocaleString('ru-RU');
  
  let message = `# DeWild Application: ${application.id}\n\n`;
  message += `👤 **Discord**: ${application.discord}\n`;
  message += `🐦 **Twitter**: ${application.twitter}\n`;
  message += `💼 **Wallet**: \`${application.wallet}\`\n`;
  message += `⏱️ **Created**: ${created}\n\n`;
  
  message += `## Current Status: ${statusEmoji} ${formatStatus(application.status)}\n\n`;
  
  // Добавляем детали в зависимости от статуса
  switch (application.status) {
    case 'pending':
      message += `Your application is being reviewed by our team. Please be patient.\n`;
      break;
    case 'approved':
      message += `Congratulations! Your application has been approved. You can now proceed to the next step and submit your NFT design.\n`;
      break;
    case 'rejected':
      message += `We're sorry, but your application has been rejected. If you think this is a mistake, please contact our team.\n`;
      break;
    case 'prompt_received':
      message += `You've received a prompt for your NFT. Please check your dashboard to proceed with creation.\n`;
      if (application.promptAssignedAt) {
        const promptDate = new Date(application.promptAssignedAt).toLocaleString('ru-RU');
        message += `📋 **Prompt received**: ${promptDate}\n`;
      }
      break;
    case 'nft_pending':
      message += `Your NFT design has been submitted and is currently under review. We'll update you soon.\n`;
      if (application.imageUploadedAt) {
        const uploadDate = new Date(application.imageUploadedAt).toLocaleString('ru-RU');
        message += `🖼️ **Design submitted**: ${uploadDate}\n`;
      }
      break;
    case 'nft_approved':
      message += `Great news! Your NFT design has been approved. You can now mint your NFT on our platform.\n`;
      break;
    case 'nft_rejected':
      message += `Your NFT design was not approved. Please check your dashboard for feedback and try again.\n`;
      break;
    case 'minted':
      message += `🎉 Congratulations! Your NFT has been successfully minted and is now part of the DeWild collection.\n`;
      if (application.mintedAt) {
        const mintDate = new Date(application.mintedAt).toLocaleString('ru-RU');
        message += `⛓️ **Minted on**: ${mintDate}\n`;
      }
      break;
    default:
      message += `Application is being processed.\n`;
  }
  
  message += `\n> Check your dashboard at https://dewild.club/dashboard for more details.`;
  
  return message;
}

// Получение эмодзи для статуса
function getStatusEmoji(status: string): string {
  switch (status) {
    case 'pending': return '⏳';
    case 'approved': return '✅';
    case 'rejected': return '❌';
    case 'prompt_received': return '📝';
    case 'prompt_expired': return '⏰';
    case 'nft_pending': return '🔍';
    case 'nft_approved': return '🎨';
    case 'nft_rejected': return '🚫';
    case 'minted': return '🏆';
    case 'unminted': return '📦';
    default: return '❓';
  }
}

// Форматирование статуса
function formatStatus(status: string): string {
  switch (status) {
    case 'pending': return 'Pending Review';
    case 'approved': return 'Application Approved';
    case 'rejected': return 'Application Rejected';
    case 'prompt_received': return 'Prompt Received';
    case 'prompt_expired': return 'Prompt Expired';
    case 'nft_pending': return 'NFT Design Under Review';
    case 'nft_approved': return 'NFT Design Approved';
    case 'nft_rejected': return 'NFT Design Rejected';
    case 'minted': return 'NFT Minted';
    case 'unminted': return 'Ready for Minting';
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

// Обновление роли пользователя
async function updateUserRole(discordTag: string, applicationStatus: string): Promise<boolean> {
  try {
    // Получаем Discord ID пользователя
    const userId = await getUserIdByUsername(discordTag);
    if (!userId) {
      console.error(`User ${discordTag} not found in Discord server`);
      return false;
    }
    
    // Определяем роль, которую нужно добавить
    let roleId = '';
    
    switch (applicationStatus) {
      case 'approved':
        roleId = process.env.DISCORD_DEWILD_PROSPECT_ROLE_ID || '';
        break;
      case 'minted':
        roleId = process.env.DISCORD_DEWILD_ARTIST_ROLE_ID || '';
        break;
      default:
        // Для других статусов не меняем роль
        return true;
    }
    
    if (!roleId) {
      console.warn(`Role ID not configured for status: ${applicationStatus}`);
      return false;
    }
    
    // Добавляем роль пользователю
    await axios.put(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_SERVER_ID}/members/${userId}/roles/${roleId}`,
      {},
      { 
        headers: {
          'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    return true;
  } catch (error) {
    console.error('Failed to update user role:', error);
    return false;
  }
}

// Основная функция миграции
async function migrateApplicationsToDiscord() {
  try {
    console.log('Starting Discord channels migration...');

    // Получаем все ID заявок
    const applicationIds = await getAllApplicationIds();
    console.log(`Found ${applicationIds.length} applications`);
    
    // Счетчики
    let created = 0;
    let skipped = 0;
    let errors = 0;
    let migrated = 0;
    
    // Обрабатываем каждую заявку
    for (const id of applicationIds) {
      try {
        // Получаем данные заявки
        const app = await getApplicationById(id);
        if (!app) {
          console.error(`Application ${id} not found`);
          errors++;
          continue;
        }
        
        // Проверяем, есть ли уже ID канала в заявке
        if (app.discordChannelId) {
          console.log(`Application ${id} already has Discord channel ID: ${app.discordChannelId}`);
          
          // Обновляем сообщение статуса в существующем канале
          try {
            await sendApplicationStatusMessage(app.discordChannelId, app);
            console.log(`Status message updated in channel ${app.discordChannelId}`);
          } catch (msgError) {
            console.error(`Error updating status in channel ${app.discordChannelId}:`, msgError);
          }
          
          skipped++;
          continue;
        }
        
        // Проверяем, есть ли канал в старой системе маппингов
        const oldChannelId = await getOldApplicationChannel(id);
        if (oldChannelId) {
          console.log(`Found channel ${oldChannelId} for application ${id} in old mapping, migrating...`);
          
          // Обновляем заявку с ID канала из старой системы
          await updateApplication(id, { discordChannelId: oldChannelId });
          
          // Обновляем сообщение в канале
          try {
            await sendApplicationStatusMessage(oldChannelId, app);
            console.log(`Status message updated in channel ${oldChannelId}`);
          } catch (msgError) {
            console.error(`Error updating status in channel ${oldChannelId}:`, msgError);
          }
          
          migrated++;
          continue;
        }
        
        // Если канала нет ни в заявке, ни в старой системе - создаем новый
        console.log(`Creating new Discord channel for application ${id}...`);
        const channelId = await createApplicationChannel(app);
        
        if (!channelId) {
          console.error(`Failed to create channel for application ${id}`);
          errors++;
          continue;
        }
        
        // Сохраняем ID канала в заявке
        await updateApplication(id, { discordChannelId: channelId });
        
        console.log(`Created channel ${channelId} for application ${id}`);
        created++;
        
        // Обновляем роль пользователя, если нужно
        if (app.status === 'approved' || app.status === 'minted') {
          await updateUserRole(app.discord, app.status);
        }
        
        // Небольшая пауза, чтобы не перегружать Discord API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing application ${id}:`, error);
        errors++;
      }
    }
    
    console.log('\nMigration complete!');
    console.log(`Created new channels: ${created}`);
    console.log(`Migrated from old mapping: ${migrated}`);
    console.log(`Skipped (already have channel): ${skipped}`);
    console.log(`Errors: ${errors}`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Запускаем миграцию
migrateApplicationsToDiscord()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Unhandled error during migration:', error);
    process.exit(1);
  });