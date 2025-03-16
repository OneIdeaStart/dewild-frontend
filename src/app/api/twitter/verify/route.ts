import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

// Используем переменные окружения для конфиденциальной информации
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
// Продолжаем использовать TASK_ID, который теперь должен указывать на twitter-scraper-lite
const TASK_ID = process.env.APIFY_TASK_ID || 'ZeEKg1CpUwyFQhLa1';

// Функции извлечения данных остаются без изменений
const extractTwitterHandle = (tweet: any, tweetUrl: string): string => {
  if (tweet?.user?.username) return tweet.user.username;
  if (tweet?.user?.screen_name) return tweet.user.screen_name;
  if (tweet?.author?.userName) return tweet.author.userName;
  if (tweet?.author?.screen_name) return tweet.author.screen_name;
  
  const match = tweetUrl.match(/^https?:\/\/(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
  return match ? match[2] : '';
};

const extractTweetText = (tweet: any): string => {
  if (typeof tweet?.text === 'string') return tweet.text;
  if (typeof tweet?.full_text === 'string') return tweet.full_text;
  if (typeof tweet?.content === 'string') return tweet.content;
  return '';
};

export async function POST(request: Request) {
  const { tweetUrl, verificationCode } = await request.json();

  if (!tweetUrl) {
    return NextResponse.json({ verified: false, error: 'Tweet URL is required' });
  }

  if (!APIFY_API_TOKEN) {
    console.error("APIFY_API_TOKEN is not set in environment variables");
    return NextResponse.json({ verified: false, error: 'API configuration error' });
  }

  try {
    console.log("Requesting tweet:", tweetUrl);

    // Проверяем формат URL твита
    const tweetUrlRegex = /^https?:\/\/(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)$/;
    const match = tweetUrl.match(tweetUrlRegex);
    
    if (!match) {
      return NextResponse.json({ 
        verified: false, 
        error: 'Invalid tweet URL format' 
      });
    }

    // Инициализируем клиент Apify
    const client = new ApifyClient({
      token: APIFY_API_TOKEN,
    });

    // Продолжаем использовать задачу, но с новым скраппером
    const run = await client.task(TASK_ID).call({
      "startUrls": [tweetUrl],
      "maxItems": 1
    });

    console.log("Run successful, ID:", run.id);
    
    // Получаем результаты из датасета
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log("Retrieved items:", items.length);
    
    if (!items || items.length === 0) {
      return NextResponse.json({ 
        verified: false, 
        error: 'Tweet not found or cannot be accessed' 
      });
    }
    
    const tweet = items[0];
    
    // Извлекаем текст и имя пользователя
    const tweetText = extractTweetText(tweet);
    const twitterHandle = extractTwitterHandle(tweet, tweetUrl);
    
    console.log('Tweet content:', tweetText);
    console.log('Twitter handle:', twitterHandle);
    console.log('Verification code:', verificationCode);
    
    // Проверяем, содержит ли твит код верификации
    const isVerified = tweetText.includes(verificationCode);
    
    return NextResponse.json({ 
      verified: isVerified,
      actualWildRating: verificationCode,
      twitterHandle: twitterHandle
    });
  } catch (error) {
    console.error('Twitter verification error:', error);
    
    // Извлекаем имя пользователя из URL для сообщения об ошибке
    const twitterHandle = tweetUrl.split('/')[3] || '';
    
    return NextResponse.json({ 
      verified: false, 
      error: 'Failed to verify tweet. Please try again later.',
      twitterHandle: twitterHandle
    });
  }
}