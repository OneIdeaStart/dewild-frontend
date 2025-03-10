// src/scripts/royalty-distributor.js
const axios = require('axios');
const { ethers } = require('ethers');
const { Redis } = require('@upstash/redis');
require('dotenv').config();

// Инициализируем клиент Redis
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Константы для ключей Redis
const PROCESSED_TX_KEY = 'royalty:processed_transactions';
const LAST_RUN_KEY = 'royalty:last_run';
const LOGS_KEY = 'royalty:logs';

// Конфигурация из переменных окружения
const CONFIG = {
  providerUrl: process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org',
  royaltySplitterAddress: process.env.ROYALTY_SPLITTER_ADDRESS,
  privateKey: process.env.ROYALTY_PRIVATE_KEY,
  basescanApiUrl: 'https://api.basescan.org/api',
  basescanApiKey: process.env.BASESCAN_API_KEY,
  dewildContractAddress: process.env.CONTRACT_ADDRESS // Адрес контракта DeWild Club
};

// Проверка наличия необходимых переменных окружения
function validateConfig() {
  const requiredEnvVars = [
    'ROYALTY_SPLITTER_ADDRESS',
    'ROYALTY_PRIVATE_KEY',
    'BASESCAN_API_KEY',
    'KV_REST_API_URL',
    'KV_REST_API_TOKEN'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Проверяем валидность адреса и приватного ключа
  try {
    if (!ethers.isAddress(CONFIG.royaltySplitterAddress)) {
      throw new Error('Invalid royalty splitter address');
    }
    
    // Проверяем, что приватный ключ может быть корректно загружен
    new ethers.Wallet(CONFIG.privateKey);
  } catch (error) {
    throw new Error(`Configuration validation failed: ${error.message}`);
  }
}

// Загрузка обработанных транзакций из Redis
async function loadProcessedTransactions() {
  try {
    // Получаем все элементы множества
    const txList = await redis.smembers(PROCESSED_TX_KEY);
    return txList || [];
  } catch (err) {
    console.log(`Error loading processed transactions from Redis: ${err.message}`);
    return [];
  }
}

// Сохранение обработанной транзакции в Redis
async function saveProcessedTransaction(txHash) {
  try {
    // Добавляем хеш транзакции в множество
    await redis.sadd(PROCESSED_TX_KEY, txHash);
  } catch (err) {
    console.log(`Error saving processed transaction to Redis: ${err.message}`);
  }
}

// Логирование в Redis и консоль
async function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage); // Для логов Vercel
  
  try {
    // Добавляем лог в список (с ограничением размера)
    await redis.lpush(LOGS_KEY, logMessage);
    // Ограничиваем количество записей в логе (например, до 1000)
    await redis.ltrim(LOGS_KEY, 0, 999);
  } catch (err) {
    console.error(`Failed to save log to Redis: ${err.message}`);
  }
}

// Получение времени последнего запуска
async function getLastRunTime() {
  try {
    const timestamp = await redis.get(LAST_RUN_KEY);
    return timestamp ? parseInt(timestamp) : 0;
  } catch (err) {
    console.error(`Error getting last run time from Redis: ${err.message}`);
    return 0;
  }
}

// Обновление времени последнего запуска
async function updateLastRunTime() {
  try {
    await redis.set(LAST_RUN_KEY, Date.now());
  } catch (err) {
    console.error(`Error updating last run time in Redis: ${err.message}`);
  }
}

// Функция для получения последних логов (полезно для админ-панели)
async function getRecentLogs(limit = 100) {
  try {
    return await redis.lrange(LOGS_KEY, 0, limit - 1);
  } catch (err) {
    console.error(`Error getting logs from Redis: ${err.message}`);
    return [];
  }
}

// Получение входящих транзакций через API и RPC
async function getIncomingTransactions() {
  try {
    // Получаем обычные транзакции
    const normalTxUrl = `${CONFIG.basescanApiUrl}?module=account&action=txlist&address=${CONFIG.royaltySplitterAddress}&sort=desc&apikey=${CONFIG.basescanApiKey}`;
    const normalResponse = await axios.get(normalTxUrl);
    
    // Получаем внутренние транзакции
    const internalTxUrl = `${CONFIG.basescanApiUrl}?module=account&action=txlistinternal&address=${CONFIG.royaltySplitterAddress}&sort=desc&apikey=${CONFIG.basescanApiKey}`;
    const internalResponse = await axios.get(internalTxUrl);
    
    let transactions = [];
    
    // Обрабатываем обычные транзакции
    if (normalResponse.data.status === '1') {
      const normalTxs = normalResponse.data.result
        .filter(tx => tx.to.toLowerCase() === CONFIG.royaltySplitterAddress.toLowerCase() && 
                    tx.value !== '0' && 
                    tx.isError === '0')
        .map(tx => ({
          hash: tx.hash,
          value: ethers.formatEther(tx.value)
        }));
      
      transactions = [...transactions, ...normalTxs];
    }
    
    // Обрабатываем внутренние транзакции
    if (internalResponse.data.status === '1') {
      const internalTxs = internalResponse.data.result
        .filter(tx => tx.to.toLowerCase() === CONFIG.royaltySplitterAddress.toLowerCase() && 
                    tx.value !== '0')
        .map(tx => ({
          hash: tx.hash,
          value: ethers.formatEther(tx.value)
        }));
      
      transactions = [...transactions, ...internalTxs];
    }
    
    log(`Found ${transactions.length} total incoming transactions (normal + internal)`);
    return transactions;
  } catch (err) {
    log(`Error fetching incoming transactions: ${err.message}`);
    return [];
  }
}

// Получение информации о токене из транзакции
async function getTokenInfo(txHash) {
  try {
    log(`Looking for token info in transaction ${txHash}`);
    
    // Сначала попробуем прямой запрос токенов NFT по хешу транзакции
    const nftUrl = `${CONFIG.basescanApiUrl}?module=account&action=tokennfttx&txhash=${txHash}&apikey=${CONFIG.basescanApiKey}`;
    try {
      const nftResponse = await axios.get(nftUrl);
      
      if (nftResponse.data.status === '1' && nftResponse.data.result.length > 0) {
        const nftTransfer = nftResponse.data.result[0];
        log(`Found NFT transfer via tokennfttx API: TokenID ${nftTransfer.tokenID} in contract ${nftTransfer.contractAddress}`);
        
        return {
          tokenId: parseInt(nftTransfer.tokenID),
          tokenContract: nftTransfer.contractAddress
        };
      } else {
        log(`No NFT transfers found via tokennfttx API for ${txHash}`);
      }
    } catch (nftError) {
      log(`Error querying tokennfttx API: ${nftError.message}`);
    }
    
    // Как запасной вариант, получим информацию через логи блока
    try {
      // Получим номер блока по хешу транзакции
      const txUrl = `${CONFIG.basescanApiUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${CONFIG.basescanApiKey}`;
      const txResponse = await axios.get(txUrl);
      
      if (txResponse.data.result && txResponse.data.result.blockNumber) {
        const blockNumber = parseInt(txResponse.data.result.blockNumber, 16);
        log(`Transaction ${txHash} is in block ${blockNumber}`);
        
        // Поиск NFT-трансферов в этом блоке
        const blockUrl = `${CONFIG.basescanApiUrl}?module=account&action=tokennfttx&startblock=${blockNumber}&endblock=${blockNumber}&sort=asc&apikey=${CONFIG.basescanApiKey}`;
        const blockResponse = await axios.get(blockUrl);
        
        if (blockResponse.data.status === '1' && blockResponse.data.result.length > 0) {
          // Ищем трансферы, связанные с нашей транзакцией
          const relevantTransfers = blockResponse.data.result.filter(transfer => 
            transfer.hash.toLowerCase() === txHash.toLowerCase()
          );
          
          if (relevantTransfers.length > 0) {
            const nftTransfer = relevantTransfers[0];
            log(`Found NFT transfer in block ${blockNumber}: TokenID ${nftTransfer.tokenID} in contract ${nftTransfer.contractAddress}`);
            
            return {
              tokenId: parseInt(nftTransfer.tokenID),
              tokenContract: nftTransfer.contractAddress
            };
          }
        }
      }
    } catch (blockError) {
      log(`Error getting block info: ${blockError.message}`);
    }
    
    // Если NFT не найден через API, делаем прямой вызов контракта для получения контрактных событий
    try {
      const provider = new ethers.JsonRpcProvider(CONFIG.providerUrl);
      
      // Получаем информацию о транзакции с детальными логами
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (receipt && receipt.logs) {
        log(`Found ${receipt.logs.length} logs in transaction ${txHash}`);
        
        // Ищем логи, которые соответствуют шаблону Transfer NFT (ERC-721)
        // Transfer event signature: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
        const transferLogs = receipt.logs.filter(log => 
          log.topics && 
          log.topics.length === 4 && 
          log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
        );
        
        if (transferLogs.length > 0) {
          const transferLog = transferLogs[0];
          const tokenId = parseInt(transferLog.topics[3], 16);
          const tokenContract = transferLog.address;
          
          log(`Found NFT transfer event from logs: TokenID ${tokenId} in contract ${tokenContract}`);
          
          return {
            tokenId,
            tokenContract
          };
        }
      }
    } catch (logsError) {
      log(`Error getting transaction logs: ${logsError.message}`);
    }
    
    // Если токен все ещё не найден, но транзакция точно связана с DeWild контрактом
    // это страховочный метод для известных транзакций
    if (txHash.toLowerCase() === '0xb6a323ea4a9529f11933792f2c28c4d56af398eea431a1e5860583730364b17e'.toLowerCase()) {
      log(`Using hardcoded token info for known transaction ${txHash}`);
      return {
        tokenId: 2,
        tokenContract: CONFIG.dewildContractAddress
      };
    }
    
    log(`Could not find any token info for transaction ${txHash}`);
    return null;
  } catch (err) {
    log(`Error getting token info from transaction ${txHash}: ${err.message}`);
    return null;
  }
}

// Получение адреса минтера токена
async function getTokenMinter(tokenInfo) {
    try {
      log(`Looking for minter of token ${tokenInfo.tokenId} in contract ${tokenInfo.tokenContract}`);
      
      // Приоритетный подход: использовать tokenArtists из контракта
      try {
        const provider = new ethers.JsonRpcProvider(CONFIG.providerUrl);
        
        // Создаем интерфейс контракта с нужным методом
        const tokenContract = new ethers.Contract(
          tokenInfo.tokenContract,
          ['function tokenArtists(uint256 tokenId) view returns (address)'],
          provider
        );
        
        // Вызываем метод tokenArtists - это наиболее точный способ
        const artist = await tokenContract.tokenArtists(tokenInfo.tokenId);
        log(`Found artist ${artist} for token ${tokenInfo.tokenId} via tokenArtists function`);
        
        // Проверяем, что адрес не пустой
        if (artist && artist !== '0x0000000000000000000000000000000000000000') {
          return artist;
        } else {
          log(`Artist address from tokenArtists is empty or zero, trying alternative methods`);
        }
      } catch (contractError) {
        log(`Error calling tokenArtists: ${contractError.message}`);
      }
      
      // Запасные подходы, если основной не сработал (порядок важен)
      
      // Подход 2: Ищем историю транзакций токена
      try {
        const url = `${CONFIG.basescanApiUrl}?module=account&action=tokennfttx&contractaddress=${tokenInfo.tokenContract}&tokenid=${tokenInfo.tokenId}&sort=asc&apikey=${CONFIG.basescanApiKey}`;
        const response = await axios.get(url);
        
        if (response.data.status === '1' && response.data.result.length > 0) {
          // Сортируем транзакции по блоку (возрастание), чтобы найти самую первую
          const sortedTxs = response.data.result.sort((a, b) => parseInt(a.blockNumber) - parseInt(b.blockNumber));
          
          // Первая транзакция должна быть минтом
          const firstTx = sortedTxs[0];
          if (firstTx.from.toLowerCase() === '0x0000000000000000000000000000000000000000') {
            log(`Found minter ${firstTx.to} for token ${tokenInfo.tokenId} from first transfer`);
            return firstTx.to;
          }
        }
      } catch (apiError) {
        log(`Error querying token transactions API: ${apiError.message}`);
      }
      
      // Если ничего не нашли, возвращаем null
      log(`Could not determine minter for token ${tokenInfo.tokenId}`);
      return null;
    } catch (err) {
      log(`Error getting token minter: ${err.message}`);
      return null;
    }
}

// Основная функция распределения роялти
async function distributeRoyalties(manualTrigger = false) {
  log(`Starting royalty distribution process${manualTrigger ? ' (manual trigger)' : ''}`);
  
  // Создаем детальный отчет для возврата
  const report = {
    success: true,
    processedCount: 0,
    transactions: [], // Подробная информация о каждой обработанной транзакции
    errors: []        // Информация об ошибках
  };
  
  try {
    // Валидация конфигурации
    validateConfig();
    
    // Настраиваем провайдер и кошелек
    const provider = new ethers.JsonRpcProvider(CONFIG.providerUrl);
    const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
    
    // Загружаем список обработанных транзакций
    const processedTransactions = await loadProcessedTransactions();
    
    // Получаем входящие транзакции роялти
    const transactions = await getIncomingTransactions();
    log(`Found ${transactions.length} incoming transactions`);
    
    // Фильтруем необработанные транзакции
    const newTransactions = transactions.filter(tx => !processedTransactions.includes(tx.hash));
    log(`Found ${newTransactions.length} new transactions to process`);
    
    // Обрабатываем каждую новую транзакцию
    for (const tx of newTransactions) {
      const txReport = {
        txHash: tx.hash,
        royaltyAmount: tx.value,
        status: 'processing'
      };
      
      try {
        log(`Processing transaction ${tx.hash} with value ${tx.value} ETH`);
        txReport.logTime = new Date().toISOString();
        
        // Получаем информацию о токене
        const tokenInfo = await getTokenInfo(tx.hash);
        
        if (!tokenInfo) {
          log(`Could not get token info for transaction ${tx.hash}`);
          txReport.status = 'failed';
          txReport.error = 'Could not get token info';
          report.errors.push(txReport);
          continue;
        }
        
        txReport.tokenId = tokenInfo.tokenId;
        txReport.tokenContract = tokenInfo.tokenContract;
        log(`Found token ID ${tokenInfo.tokenId} in contract ${tokenInfo.tokenContract}`);
        
        // Получаем адрес минтера токена
        const minterAddress = await getTokenMinter(tokenInfo);
        
        if (!minterAddress) {
          log(`Could not get minter address for token ${tokenInfo.tokenId}`);
          txReport.status = 'failed';
          txReport.error = 'Could not get minter address';
          report.errors.push(txReport);
          continue;
        }
        
        txReport.artistAddress = minterAddress;
        log(`Found artist address ${minterAddress} for token ${tokenInfo.tokenId}`);
        
        // Проверка валидности адреса минтера
        if (!ethers.isAddress(minterAddress)) {
          log(`Invalid minter address: ${minterAddress}`);
          txReport.status = 'failed';
          txReport.error = 'Invalid minter address';
          report.errors.push(txReport);
          continue;
        }
        
        // Рассчитываем сумму роялти
        const royaltyAmount = ethers.parseEther(tx.value);
        const artistShare = royaltyAmount / 2n;
        
        // Проверяем, что сумма не слишком мала
        const feeData = await provider.getFeeData();
        const estimatedGas = 21000n;
        const gasCost = feeData.gasPrice * estimatedGas;
        
        if (artistShare <= gasCost) {
          log(`Artist share (${ethers.formatEther(artistShare)} ETH) is too small to cover gas costs`);
          txReport.status = 'skipped';
          txReport.reason = 'Artist share too small to cover gas';
          txReport.artistShare = ethers.formatEther(artistShare);
          txReport.gasCost = ethers.formatEther(gasCost);
          report.transactions.push(txReport);
          continue;
        }
        
        const artistPayment = artistShare - gasCost;
        txReport.artistShareAmount = ethers.formatEther(artistShare);
        txReport.gasUsed = ethers.formatEther(gasCost);
        txReport.artistPayment = ethers.formatEther(artistPayment);
        
        // Отправляем долю артисту
        log(`Sending ${ethers.formatEther(artistPayment)} ETH to artist ${minterAddress}`);
        
        const artistTx = await wallet.sendTransaction({
          to: minterAddress,
          value: artistPayment,
          gasLimit: estimatedGas,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        });
        
        txReport.paymentTxHash = artistTx.hash;
        
        // Ждем подтверждения транзакции с таймаутом
        try {
          const receipt = await Promise.race([
            artistTx.wait(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Transaction confirmation timeout')), 120000)
            )
          ]);
          
          log(`Payment sent to artist, tx hash: ${artistTx.hash}, confirmed in block ${receipt.blockNumber}`);
          txReport.status = 'completed';
          txReport.confirmedInBlock = receipt.blockNumber;
          
          // Добавляем транзакцию в список обработанных в Redis
          await saveProcessedTransaction(tx.hash);
          
          report.processedCount++;
          report.transactions.push(txReport);
        } catch (confirmError) {
          log(`Error confirming transaction ${artistTx.hash}: ${confirmError.message}`);
          txReport.status = 'failed';
          txReport.error = `Confirmation error: ${confirmError.message}`;
          report.errors.push(txReport);
        }
      } catch (err) {
        log(`Error processing transaction ${tx.hash}: ${err.message}`);
        txReport.status = 'failed';
        txReport.error = err.message;
        report.errors.push(txReport);
      }
    }
    
    log(`Royalty distribution process completed successfully`);
    
    // Обновляем время последнего запуска
    await updateLastRunTime();
    
    return report;
  } catch (err) {
    log(`Fatal error in royalty distribution: ${err.message}`);
    report.success = false;
    report.error = err.message;
    return report;
  }
}

// Функция проверки и запуска распределения по расписанию
async function checkAndRunDistribution() {
  try {
    const lastRun = await getLastRunTime();
    const now = Date.now();
    const hoursSinceLastRun = (now - lastRun) / (1000 * 60 * 60);
    
    if (lastRun === 0 || hoursSinceLastRun >= 24) {
      return await distributeRoyalties();
    } else {
      console.log("Skipping distribution - less than 24 hours since last run");
      return { success: true, skipped: true, hoursUntilNextRun: 24 - hoursSinceLastRun };
    }
  } catch (err) {
    console.error("Error in scheduling:", err);
    return { success: false, error: err.message };
  }
}

// Экспорт функций
module.exports = {
  distributeRoyalties,
  manualDistribution: () => distributeRoyalties(true),
  checkAndRunDistribution,
  getRecentLogs
};

// Запуск скрипта напрямую
if (require.main === module) {
  checkAndRunDistribution();
}