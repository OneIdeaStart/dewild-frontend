// src/app/api/contracts/approve-artist/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { CONTRACTS, ABIS } from '@/lib/web3/contracts';
import { DB } from '@/lib/db';

// Получаем конфигурацию из переменных окружения
const PRIVATE_KEY = process.env.CONTRACT_ADMIN_PRIVATE_KEY || '';
const RPC_URL = process.env.BASE_TESTNET_RPC_URL || 'https://sepolia.base.org';

export async function POST(request: Request) {
    try {
      // Читаем тело запроса только один раз
      const requestData = await request.json();
      const { wallet, applicationId } = requestData;
      
      if (!wallet) {
        return NextResponse.json({ error: 'Artist wallet address is required' }, { status: 400 });
      }
    
      if (!applicationId) {
        return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
      }
    
      // Проверка валидности кошелька
      if (!wallet.match(/^0x[a-fA-F0-9]{40}$/)) {
        return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
      }
    
      // Проверяем наличие приватного ключа
      if (!PRIVATE_KEY || PRIVATE_KEY === '') {
        return NextResponse.json({ 
          error: 'CONTRACT_ADMIN_PRIVATE_KEY environment variable is not set' 
        }, { status: 500 });
      }
    
      // Настройка провайдера и кошелька
      let provider;
      try {
        provider = new ethers.JsonRpcProvider(RPC_URL);
      } catch (providerError: any) {
        return NextResponse.json({ 
          error: `Failed to initialize provider: ${providerError.message}` 
        }, { status: 500 });
      }
    
      let adminWallet;
      try {
          adminWallet = new ethers.Wallet(PRIVATE_KEY, provider);
      } catch (walletError: any) {
          return NextResponse.json({ 
              error: `Failed to initialize wallet: ${walletError.message}` 
          }, { status: 500 });
      }
    
      try {
        // Проверяем подключение к сети
        const network = await provider.getNetwork();
        
        // Получаем баланс админского кошелька
        const adminBalance = await provider.getBalance(adminWallet.address);
        
        if (adminBalance === BigInt(0)) {
          return NextResponse.json({ 
            error: 'Admin wallet has no ETH for gas' 
          }, { status: 500 });
        }
      } catch (networkError: any) {
        return NextResponse.json({ 
          error: `Failed to connect to network: ${networkError.message}` 
        }, { status: 500 });
      }
    
      // Получаем адрес контракта DeWildClub
      const contractAddress = CONTRACTS.TESTNET.DeWildClub;
      
      // Исправление: Используем первый элемент массива ABI
      const abi = ABIS.DeWildClub as any;
      
      // Создаем экземпляр контракта
      let contract;
      try {
        contract = new ethers.Contract(
          contractAddress, 
          abi, 
          adminWallet
        );
      } catch (contractError: any) {
        return NextResponse.json({ 
          error: `Failed to create contract instance: ${contractError.message}` 
        }, { status: 500 });
      }
      
      // Проверяем, не одобрен ли уже этот артист
      let isApproved;
      try {
        isApproved = await contract.approvedArtists(wallet);
      } catch (approvedCheckError: any) {
        return NextResponse.json({ 
          error: `Failed to check if artist is approved: ${approvedCheckError.message}` 
        }, { status: 500 });
      }
      
      let txHash = '';
      
      if (!isApproved) {
        try {
          // Вызываем функцию одобрения артиста
          const tx = await contract.approveArtist(wallet);
          
          // Ждем подтверждения транзакции
          const receipt = await tx.wait();
          txHash = receipt.hash;
        } catch (approveError: any) {
          return NextResponse.json({ 
            error: `Failed to approve artist in contract: ${approveError.message}` 
          }, { status: 500 });
        }
      }
      
      // Генерируем подпись для минтинга
      let signature;
      try {
        // Хэшируем адрес артиста согласно формату контракта
        const messageHash = ethers.keccak256(
          ethers.solidityPacked(['address'], [wallet])
        );
        
        // Подписываем хэш
        signature = await adminWallet.signMessage(ethers.getBytes(messageHash));
      } catch (signError: any) {
        return NextResponse.json({ 
          error: `Failed to generate signature: ${signError.message}` 
        }, { status: 500 });
      }
      
      // Сохраняем подпись в базе данных
      try {
        await DB.saveNFTSignature(applicationId, signature);
      } catch (dbError: any) {
        return NextResponse.json({ 
          error: `Failed to save signature to database: ${dbError.message}`,
          wasApproved: true,  // Контракт мог быть обновлен, но подпись не сохранилась
          txHash,
          signature
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Artist approved and signature generated',
        wasAlreadyApproved: isApproved,
        txHash,
        signature
      });
      
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message || 'Failed to approve artist in contract' },
        { status: 500 }
        );
    }
}