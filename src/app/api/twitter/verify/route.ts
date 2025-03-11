import { NextResponse } from 'next/server'
import { ApifyClient } from 'apify-client';

// Используем переменные окружения
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const TASK_ID = process.env.APIFY_TASK_ID;

// Функция для получения имени пользователя
const getUsernameFromTweet = (tweet: any, tweetUrl: string): string => {
  if (tweet && typeof tweet === 'object') {
    if (tweet.user && typeof tweet.user === 'object' && typeof tweet.user.username === 'string') {
      return tweet.user.username;
    }
    
    if (typeof tweet.username === 'string') {
      return tweet.username;
    }
  }
  
  // Извлечение из URL как запасной вариант
  try {
    const urlParts = tweetUrl.split('/');
    return urlParts[3] || '';
  } catch (e) {
    return '';
  }
};

export async function POST(request: Request) {
  const { tweetUrl, verificationCode } = await request.json();

  if (!tweetUrl) {
    return NextResponse.json({ verified: false, error: 'Tweet URL is required' });
  }

  if (!APIFY_API_TOKEN || !TASK_ID) {
    console.error("Apify credentials not properly configured");
    return NextResponse.json({ verified: false, error: 'API configuration error' });
  }

  try {
    console.log("Requesting tweet:", tweetUrl);

    // Инициализируем клиент Apify
    const client = new ApifyClient({
      token: APIFY_API_TOKEN,
    });

    // Запускаем задачу и ждем ее завершения
    const run = await client.task(TASK_ID).call({
      "startUrls": [tweetUrl],
      maxTweets: 1,
      addUserInfo: true
    });

    console.log("Run successful, ID:", run.id);
    
    // Получаем результаты из датасета
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log("Retrieved items:", items.length);
    
    if (!items || items.length === 0) {
      return NextResponse.json({ verified: false, error: 'Tweet not found or cannot be accessed' });
    }
    
    const tweet = items[0];
    
    // Получаем текст твита
    const tweetText = typeof tweet.text === 'string' ? tweet.text : '';
    
    console.log('Tweet content:', tweetText);
    
    // Получаем имя пользователя
    const twitterHandle = getUsernameFromTweet(tweet, tweetUrl);
    
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
    
    // Извлекаем имя пользователя из URL
    const twitterHandle = tweetUrl.split('/')[3] || '';
    
    // Возвращаем ошибку
    return NextResponse.json({ 
      verified: false, 
      error: 'Failed to verify tweet. Please try again later.',
      twitterHandle: twitterHandle
    });
  }
}