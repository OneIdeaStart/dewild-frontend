// src/app/api/contracts/revoke-artist/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { CONTRACTS, ABIS } from '@/lib/web3/contracts';
import { DB } from '@/lib/db';

// Получаем конфигурацию из переменных окружения
const PRIVATE_KEY = process.env.CONTRACT_ADMIN_PRIVATE_KEY || '';
const RPC_URL = process.env.BASE_TESTNET_RPC_URL || 'https://sepolia.base.org';

export async function POST(request: Request) {
    try {
      // Читаем тело запроса
      const requestData = await request.json();
      const { wallet, applicationId } = requestData;
      
      if (!wallet) {
        return NextResponse.json({ error: 'Artist wallet address is required' }, { status: 400 });
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
        await provider.getNetwork();
        
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
      
      // Используем первый элемент массива ABI
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
      
      // Проверяем, одобрен ли этот артист
      let isApproved;
      try {
        isApproved = await contract.approvedArtists(wallet);
      } catch (approvedCheckError: any) {
        return NextResponse.json({ 
          error: `Failed to check if artist is approved: ${approvedCheckError.message}` 
        }, { status: 500 });
      }
      
      // Если артист не одобрен, нет смысла его отзывать
      if (!isApproved) {
        return NextResponse.json({ 
          success: true, 
          message: 'Artist was not approved, no need to revoke',
          wasAlreadyRevoked: true
        });
      }
      
      // Отзываем артиста
      let txHash = '';
      try {
        // Вызываем функцию отзыва артиста
        const tx = await contract.revokeArtist(wallet);
        
        // Ждем подтверждения транзакции
        const receipt = await tx.wait();
        txHash = receipt.hash;
      } catch (revokeError: any) {
        return NextResponse.json({ 
          error: `Failed to revoke artist in contract: ${revokeError.message}` 
        }, { status: 500 });
      }
      
      // Если указан ID заявки, очищаем подпись
      if (applicationId) {
        try {
          // Записываем пустую подпись в БД
          await DB.saveNFTSignature(applicationId, "");
        } catch (dbError: any) {
          return NextResponse.json({ 
            warning: `Artist revoked but failed to clear signature: ${dbError.message}`,
            success: true,
            txHash
          });
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Artist revoked successfully',
        txHash
      });
      
    } catch (error: any) {
        return NextResponse.json(
        { error: error.message || 'Failed to revoke artist in contract' },
        { status: 500 }
        );
    }
}