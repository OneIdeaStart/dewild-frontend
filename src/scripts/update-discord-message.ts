// src/scripts/update-discord-message.ts
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
  APPLICATION_CHANNEL_MAP: 'discord:application:channel',
  CHANNEL_APPLICATION_MAP: 'discord:channel:application',
};

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

// Функция для получения всех ID заявок
async function getAllApplicationIds(): Promise<string[]> {
  try {
    return await kv.smembers('applications:all');
  } catch (error) {
    console.error('Error getting all application IDs:', error);
    return [];
  }
}

// Получение Discord канала для заявки
async function getApplicationChannel(applicationId: string): Promise<string | null> {
  try {
    return kv.hget<string>(DB_KEYS.APPLICATION_CHANNEL_MAP, applicationId);
  } catch (error) {
    console.error('Error getting application channel:', error);
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
    
    console.log(`Sent status message to channel ${channelId} for application ${application.id}`);
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
  
  message += `\n> Check your dashboard at [https://dewild.club/dashboard](https://dewild.club/dashboard) for more details.`;
  
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

// Основная функция для обновления сообщений в каналах
async function updateAllDiscordMessages() {
  try {
    console.log('Updating Discord channel messages...');

    // Получаем все ID заявок
    const applicationIds = await getAllApplicationIds();
    console.log(`Found ${applicationIds.length} applications`);
    
    // Счетчики
    let updated = 0;
    let errors = 0;
    
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
        
        // Получаем ID канала для заявки
        const channelId = await getApplicationChannel(id);
        if (!channelId) {
          console.error(`No Discord channel found for application ${id}`);
          errors++;
          continue;
        }
        
        // Отправляем сообщение в канал
        console.log(`Updating Discord message for application ${id} in channel ${channelId}...`);
        const success = await sendApplicationStatusMessage(channelId, app);
        
        if (success) {
          updated++;
        } else {
          errors++;
        }
        
        // Небольшая пауза, чтобы не перегружать Discord API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing application ${id}:`, error);
        errors++;
      }
    }
    
    console.log('\nUpdate complete!');
    console.log(`Updated: ${updated}`);
    console.log(`Errors: ${errors}`);
    
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  }
}

// Функция для обновления сообщения для конкретной заявки
async function updateSingleApplication(applicationId: string) {
  try {
    console.log(`Updating Discord message for application ${applicationId}...`);
    
    // Получаем данные заявки
    const app = await getApplicationById(applicationId);
    if (!app) {
      console.error(`Application ${applicationId} not found`);
      return false;
    }
    
    // Получаем ID канала для заявки
    const channelId = await getApplicationChannel(applicationId);
    if (!channelId) {
      console.error(`No Discord channel found for application ${applicationId}`);
      return false;
    }
    
    // Отправляем сообщение в канал
    const success = await sendApplicationStatusMessage(channelId, app);
    
    if (success) {
      console.log(`Successfully updated Discord message for application ${applicationId}`);
    } else {
      console.error(`Failed to update Discord message for application ${applicationId}`);
    }
    
    return success;
  } catch (error) {
    console.error(`Error updating application ${applicationId}:`, error);
    return false;
  }
}

// Запускаем обновление для конкретной заявки, если указан ID
const applicationId = process.argv[2];
if (applicationId) {
  updateSingleApplication(applicationId)
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
} else {
  // Иначе обновляем все заявки
  updateAllDiscordMessages()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}