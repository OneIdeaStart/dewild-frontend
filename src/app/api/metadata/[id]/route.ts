// @ts-nocheck
// src/app/api/metadata/[id]/route.ts
import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { getPinataUrl } from '@/lib/pinata';

export async function GET(
  request: Request,
  { params }
) {
  try {
    const id = params.id;
    console.log(`Запрос метаданных для NFT #${id}`);
    
    // Получаем информацию о NFT по ID
    const nftInfo = await kv.hgetall(`nft:${id}`);
    console.log(`Данные из Redis:`, nftInfo);
    
    if (!nftInfo || !nftInfo.ipfsMetadata) {
      console.log(`NFT #${id} не найден или не имеет метаданных`);
      return NextResponse.json({ error: 'NFT metadata not found' }, { status: 404 });
    }
    
    // Получаем метаданные из IPFS
    const metadataUrl = getPinataUrl(nftInfo.ipfsMetadata as string);
    console.log(`URL метаданных IPFS:`, metadataUrl);
    
    const response = await fetch(metadataUrl);
    
    if (!response.ok) {
      console.log(`Ошибка при получении метаданных из IPFS: ${response.status} ${response.statusText}`);
      return NextResponse.json({ 
        error: `Failed to fetch metadata from IPFS: ${response.statusText}` 
      }, { status: 500 });
    }
    
    const metadata = await response.json();
    console.log(`Метаданные успешно получены`);
    
    return NextResponse.json(metadata);
  } catch (error: any) {
    console.error('Ошибка при получении метаданных:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata', details: error?.message },
      { status: 500 }
    );
  }
}