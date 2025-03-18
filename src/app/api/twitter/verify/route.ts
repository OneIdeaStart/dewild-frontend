import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

// Use environment variables for confidential information
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
// Continue using TASK_ID, which now should point to twitter-scraper-lite
const TASK_ID = process.env.APIFY_TASK_ID || 'ZeEKg1CpUwyFQhLa1';

// Extraction functions remain unchanged
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

    // Check tweet URL format
    const tweetUrlRegex = /^https?:\/\/(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/(\d+)$/;
    const match = tweetUrl.match(tweetUrlRegex);
    
    if (!match) {
      return NextResponse.json({ 
        verified: false, 
        error: 'Invalid tweet URL format' 
      });
    }

    // Initialize Apify client
    const client = new ApifyClient({
      token: APIFY_API_TOKEN,
    });

    // Continue using task, but with new scraper
    const run = await client.task(TASK_ID).call({
      "startUrls": [tweetUrl],
      "maxItems": 1
    });

    console.log("Run successful, ID:", run.id);
    
    // Get results from dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    console.log("Retrieved items:", items.length);
    
    if (!items || items.length === 0) {
      return NextResponse.json({ 
        verified: false, 
        error: 'Tweet not found or cannot be accessed' 
      });
    }
    
    const tweet = items[0];
    
    // Extract text and username
    const tweetText = extractTweetText(tweet);
    const twitterHandle = extractTwitterHandle(tweet, tweetUrl);
    
    console.log('Tweet content:', tweetText);
    console.log('Twitter handle:', twitterHandle);
    console.log('Verification code:', verificationCode);
    
    // Check if tweet contains verification code
    const isVerified = tweetText.includes(verificationCode);
    
    return NextResponse.json({ 
      verified: isVerified,
      actualWildRating: verificationCode,
      twitterHandle: twitterHandle
    });
  } catch (error) {
    console.error('Twitter verification error:', error);
    
    // Extract username from URL for error message
    const twitterHandle = tweetUrl.split('/')[3] || '';
    
    return NextResponse.json({ 
      verified: false, 
      error: 'Failed to verify tweet. Please try again later.',
      twitterHandle: twitterHandle
    });
  }
}