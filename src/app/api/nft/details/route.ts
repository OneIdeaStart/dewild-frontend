// src/app/api/nft/details/route.ts
import { NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { kv } from '@vercel/kv';

export async function GET(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const wallet = searchParams.get('wallet');
  
      if (!wallet) {
        return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
      }
  
      // Получаем заявку
      const application = await DB.getApplicationByWallet(wallet);
      if (!application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
  
      // Проверяем наличие данных IPFS в Redis
      const ipfsData = await kv.hgetall(`application:${application.id}`);
      
      // Получаем метаданные
      const metadata = await kv.hget(`application:${application.id}`, 'metadata');
  
      // Формируем ответ с данными IPFS, если они есть
      return NextResponse.json({ 
        id: application.id,
        imageUrl: application.imageUrl,
        status: application.status,
        ipfsImage: ipfsData?.ipfsImage,
        ipfsMetadata: ipfsData?.ipfsMetadata,
        ipfsImageUrl: ipfsData?.ipfsImage ? `https://pink-quickest-bear-821.mypinata.cloud/ipfs/${ipfsData.ipfsImage}` : null,
        ipfsMetadataUrl: ipfsData?.ipfsMetadata ? `https://pink-quickest-bear-821.mypinata.cloud/ipfs/${ipfsData.ipfsMetadata}` : null,
        metadata: typeof metadata === 'string' ? JSON.parse(metadata) : metadata
      });
    } catch (error: any) {
      console.error('Error fetching NFT details:', error);
      return NextResponse.json(
        { error: 'Failed to fetch NFT details', details: error?.message },
        { status: 500 }
      );
    }
}