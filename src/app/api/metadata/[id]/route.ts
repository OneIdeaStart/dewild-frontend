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
    // Сначала пробуем получить из существующего пути
    let nftInfo = await kv.hgetall(`nft:${id}`);
    
    // Если нет данных, пробуем альтернативный путь
    if (!nftInfo || Object.keys(nftInfo).length === 0) {
      nftInfo = await kv.hgetall(`token:${id}`);
    }
    
    // Если нет данных ни по одному из путей, проверяем приложения
    if (!nftInfo || Object.keys(nftInfo).length === 0) {
      // Попробуем получить ID приложения для этого токена
      const applicationId = await kv.get(`token:${id}:applicationId`);
      
      if (applicationId) {
        // Если нашли ID приложения, получаем данные приложения
        nftInfo = await kv.hgetall(`application:${applicationId}`);
      }
    }
    
    console.log(`Данные из Redis:`, nftInfo);
    
    // Если данные не найдены, возвращаем заглушку для тестирования
    if (!nftInfo || Object.keys(nftInfo).length === 0) {
      console.log(`NFT #${id} не найден или не имеет метаданных, возвращаем заглушку`);
      
      return NextResponse.json({
        name: `DeWild NFT #${id}`,
        description: "This is a DeWild NFT collection item.",
        image: `/images/nft-${(Number(id) % 22) + 1}.png`,
        attributes: [
          {
            trait_type: "Animal",
            value: ["Tiger", "Lion", "Wolf", "Bear", "Owl"][Number(id) % 5]
          },
          {
            trait_type: "Material",
            value: ["Metal", "Silver", "Gold", "Diamond", "Titanium"][Number(id) % 5]
          },
          {
            trait_type: "Eyes",
            value: ["Red", "Blue", "Green", "Yellow", "Purple"][Number(id) % 5]
          },
          {
            trait_type: "Background",
            value: ["Black", "White", "Blue", "Green", "Red"][Number(id) % 5]
          }
        ]
      });
    }
    
    // Если есть готовые метаданные в IPFS
    if (nftInfo.ipfsMetadata) {
      // Получаем метаданные из IPFS
      try {
        const metadataUrl = getPinataUrl(nftInfo.ipfsMetadata);
        console.log(`URL метаданных IPFS:`, metadataUrl);
        
        const response = await fetch(metadataUrl);
        
        if (!response.ok) {
          throw new Error(`IPFS request failed with status ${response.status}`);
        }
        
        const metadata = await response.json();
        console.log(`Метаданные успешно получены из IPFS`);
        
        return NextResponse.json(metadata);
      } catch (ipfsError) {
        console.error('Ошибка при получении метаданных из IPFS:', ipfsError);
        // Продолжаем к генерации метаданных
      }
    }
    
    // Если не смогли получить из IPFS или их там нет, генерируем метаданные на основе данных Redis
    console.log('Генерируем метаданные на основе данных Redis');
    
    // Формируем URL изображения
    let imageUrl;
    if (nftInfo.ipfsImage) {
      imageUrl = getPinataUrl(nftInfo.ipfsImage);
    } else {
      // Если нет IPFS изображения, используем локальное
      imageUrl = `/images/nft-${(Number(id) % 22) + 1}.png`;
    }
    
    // Формируем атрибуты
    const attributes = [];
    
    if (nftInfo.animal) {
      attributes.push({
        trait_type: "Animal",
        value: nftInfo.animal
      });
    }
    
    if (nftInfo.material) {
      attributes.push({
        trait_type: "Material",
        value: nftInfo.material
      });
    }
    
    if (nftInfo.material_color) {
      attributes.push({
        trait_type: "Material Color",
        value: nftInfo.material_color
      });
    }
    
    if (nftInfo.eyes_color) {
      attributes.push({
        trait_type: "Eyes Color",
        value: nftInfo.eyes_color
      });
    }
    
    if (nftInfo.background) {
      attributes.push({
        trait_type: "Background",
        value: nftInfo.background
      });
    }
    
    if (nftInfo.pattern_color) {
      attributes.push({
        trait_type: "Pattern Color",
        value: nftInfo.pattern_color
      });
    }
    
    const generatedMetadata = {
      name: `DeWild NFT #${id}`,
      description: nftInfo.statement
        ? `"${nftInfo.statement}" - by ${nftInfo.artist || 'Anonymous'}`
        : `DeWild NFT Collection - Item #${id}`,
      image: imageUrl,
      attributes: attributes.length > 0 ? attributes : [
        {
          trait_type: "Animal",
          value: ["Tiger", "Lion", "Wolf", "Bear", "Owl"][Number(id) % 5]
        },
        {
          trait_type: "Material",
          value: ["Metal", "Silver", "Gold", "Diamond", "Titanium"][Number(id) % 5]
        }
      ]
    };
    
    console.log('Сгенерированные метаданные:', generatedMetadata);
    return NextResponse.json(generatedMetadata);
    
  } catch (error) {
    console.error('Ошибка при получении метаданных:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata', details: error?.message },
      { status: 500 }
    );
  }
}