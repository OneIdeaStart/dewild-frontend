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
    console.log(`Metadata request for NFT #${id}`);
    
    // Get NFT information by ID
    // First try to get from existing path
    let nftInfo = await kv.hgetall(`nft:${id}`);
    
    // If no data, try alternative path
    if (!nftInfo || Object.keys(nftInfo).length === 0) {
      nftInfo = await kv.hgetall(`token:${id}`);
    }
    
    // If no data in either path, check applications
    if (!nftInfo || Object.keys(nftInfo).length === 0) {
      // Try to get application ID for this token
      const applicationId = await kv.get(`token:${id}:applicationId`);
      
      if (applicationId) {
        // If found application ID, get application data
        nftInfo = await kv.hgetall(`application:${applicationId}`);
      }
    }
    
    console.log(`Data from Redis:`, nftInfo);
    
    // If data not found, return placeholder for testing
    if (!nftInfo || Object.keys(nftInfo).length === 0) {
      console.log(`NFT #${id} not found or has no metadata, returning placeholder`);
      
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
    
    // If there are ready metadata in IPFS
    if (nftInfo.ipfsMetadata) {
      // Get metadata from IPFS
      try {
        const metadataUrl = getPinataUrl(nftInfo.ipfsMetadata);
        console.log(`IPFS metadata URL:`, metadataUrl);
        
        const response = await fetch(metadataUrl);
        
        if (!response.ok) {
          throw new Error(`IPFS request failed with status ${response.status}`);
        }
        
        const metadata = await response.json();
        console.log(`Metadata successfully retrieved from IPFS`);
        
        return NextResponse.json(metadata);
      } catch (ipfsError) {
        console.error('Error retrieving metadata from IPFS:', ipfsError);
        // Continue to metadata generation
      }
    }
    
    // If couldn't get from IPFS or it's not there, generate metadata based on Redis data
    console.log('Generating metadata based on Redis data');
    
    // Form image URL
    let imageUrl;
    if (nftInfo.ipfsImage) {
      imageUrl = getPinataUrl(nftInfo.ipfsImage);
    } else {
      // If no IPFS image, use local
      imageUrl = `/images/nft-${(Number(id) % 22) + 1}.png`;
    }
    
    // Form attributes
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
    
    console.log('Generated metadata:', generatedMetadata);
    return NextResponse.json(generatedMetadata);
    
  } catch (error) {
    console.error('Error retrieving metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata', details: error?.message },
      { status: 500 }
    );
  }
}