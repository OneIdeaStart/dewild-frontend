// src/scripts/royalty-distributor.js
const axios = require('axios');
const { ethers } = require('ethers');
const { Redis } = require('@upstash/redis');
require('dotenv').config();

// Initialize Redis client
const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Constants for Redis keys
const PROCESSED_TX_KEY = 'royalty:processed_transactions';
const LAST_RUN_KEY = 'royalty:last_run';
const LOGS_KEY = 'royalty:logs';

// Configuration from environment variables
const CONFIG = {
  providerUrl: process.env.BASE_MAINNET_RPC_URL || 'https://mainnet.base.org',
  royaltySplitterAddress: process.env.ROYALTY_SPLITTER_ADDRESS,
  privateKey: process.env.ROYALTY_PRIVATE_KEY,
  basescanApiUrl: 'https://api.basescan.org/api',
  basescanApiKey: process.env.BASESCAN_API_KEY,
  dewildContractAddress: process.env.CONTRACT_ADDRESS // Адрес контракта DeWild Club
};

// Check for necessary environment variables
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
  
  // Check validity of address and private key
  try {
    if (!ethers.isAddress(CONFIG.royaltySplitterAddress)) {
      throw new Error('Invalid royalty splitter address');
    }
    
    // Check that private key can be correctly loaded
    new ethers.Wallet(CONFIG.privateKey);
  } catch (error) {
    throw new Error(`Configuration validation failed: ${error.message}`);
  }
}

// Load processed transactions from Redis
async function loadProcessedTransactions() {
  try {
    // Get all set elements
    const txList = await redis.smembers(PROCESSED_TX_KEY);
    return txList || [];
  } catch (err) {
    console.log(`Error loading processed transactions from Redis: ${err.message}`);
    return [];
  }
}

// Save processed transaction to Redis
async function saveProcessedTransaction(txHash) {
  try {
    // Add transaction hash to set
    await redis.sadd(PROCESSED_TX_KEY, txHash);
  } catch (err) {
    console.log(`Error saving processed transaction to Redis: ${err.message}`);
  }
}

// Logging to Redis and console
async function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage); // For Vercel logs
  
  try {
    // Add log to list (with size limit)
    await redis.lpush(LOGS_KEY, logMessage);
    // Limit number of records in log (e.g., to 1000)
    await redis.ltrim(LOGS_KEY, 0, 999);
  } catch (err) {
    console.error(`Failed to save log to Redis: ${err.message}`);
  }
}

// Get time of last run
async function getLastRunTime() {
  try {
    const timestamp = await redis.get(LAST_RUN_KEY);
    return timestamp ? parseInt(timestamp) : 0;
  } catch (err) {
    console.error(`Error getting last run time from Redis: ${err.message}`);
    return 0;
  }
}

// Update time of last run
async function updateLastRunTime() {
  try {
    await redis.set(LAST_RUN_KEY, Date.now());
  } catch (err) {
    console.error(`Error updating last run time in Redis: ${err.message}`);
  }
}

// Function to get recent logs (useful for admin panel)
async function getRecentLogs(limit = 100) {
  try {
    return await redis.lrange(LOGS_KEY, 0, limit - 1);
  } catch (err) {
    console.error(`Error getting logs from Redis: ${err.message}`);
    return [];
  }
}

// Get incoming transactions through API and RPC
async function getIncomingTransactions() {
  try {
    // Get regular transactions
    const normalTxUrl = `${CONFIG.basescanApiUrl}?module=account&action=txlist&address=${CONFIG.royaltySplitterAddress}&sort=desc&apikey=${CONFIG.basescanApiKey}`;
    const normalResponse = await axios.get(normalTxUrl);
    
    // Get internal transactions
    const internalTxUrl = `${CONFIG.basescanApiUrl}?module=account&action=txlistinternal&address=${CONFIG.royaltySplitterAddress}&sort=desc&apikey=${CONFIG.basescanApiKey}`;
    const internalResponse = await axios.get(internalTxUrl);
    
    let transactions = [];
    
    // Process regular transactions
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
    
    // Process internal transactions
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

// Get token information from transaction
async function getTokenInfo(txHash) {
  try {
    log(`Looking for token info in transaction ${txHash}`);
    
    // First try direct request of NFT tokens by transaction hash
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
    
    // As fallback, get information through block logs
    try {
      // Get block number by transaction hash
      const txUrl = `${CONFIG.basescanApiUrl}?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${CONFIG.basescanApiKey}`;
      const txResponse = await axios.get(txUrl);
      
      if (txResponse.data.result && txResponse.data.result.blockNumber) {
        const blockNumber = parseInt(txResponse.data.result.blockNumber, 16);
        log(`Transaction ${txHash} is in block ${blockNumber}`);
        
        // Search for NFT transfers in this block
        const blockUrl = `${CONFIG.basescanApiUrl}?module=account&action=tokennfttx&startblock=${blockNumber}&endblock=${blockNumber}&sort=asc&apikey=${CONFIG.basescanApiKey}`;
        const blockResponse = await axios.get(blockUrl);
        
        if (blockResponse.data.status === '1' && blockResponse.data.result.length > 0) {
          // Look for transfers related to our transaction
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
    
    // If token not found through API, make direct contract call to get contract events
    try {
      const provider = new ethers.JsonRpcProvider(CONFIG.providerUrl);
      
      // Get transaction information with detailed logs
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (receipt && receipt.logs) {
        log(`Found ${receipt.logs.length} logs in transaction ${txHash}`);
        
        // Look for logs that match Transfer NFT pattern (ERC-721)
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
    
    // If token still not found but transaction is definitely related to DeWild contract
    // this is a fallback method for known transactions
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

// Get token minter address
async function getTokenMinter(tokenInfo) {
    try {
      log(`Looking for minter of token ${tokenInfo.tokenId} in contract ${tokenInfo.tokenContract}`);
      
      // Priority approach: use tokenArtists from contract
      try {
        const provider = new ethers.JsonRpcProvider(CONFIG.providerUrl);
        
        // Create contract interface with needed method
        const tokenContract = new ethers.Contract(
          tokenInfo.tokenContract,
          ['function tokenArtists(uint256 tokenId) view returns (address)'],
          provider
        );
        
        // Call tokenArtists method - this is most accurate way
        const artist = await tokenContract.tokenArtists(tokenInfo.tokenId);
        log(`Found artist ${artist} for token ${tokenInfo.tokenId} via tokenArtists function`);
        
        // Check that address is not empty
        if (artist && artist !== '0x0000000000000000000000000000000000000000') {
          return artist;
        } else {
          log(`Artist address from tokenArtists is empty or zero, trying alternative methods`);
        }
      } catch (contractError) {
        log(`Error calling tokenArtists: ${contractError.message}`);
      }
      
      // Fallback approaches if main one didn't work (order is important)
      
      // Approach 2: Look for token transaction history
      try {
        const url = `${CONFIG.basescanApiUrl}?module=account&action=tokennfttx&contractaddress=${tokenInfo.tokenContract}&tokenid=${tokenInfo.tokenId}&sort=asc&apikey=${CONFIG.basescanApiKey}`;
        const response = await axios.get(url);
        
        if (response.data.status === '1' && response.data.result.length > 0) {
          // Sort transactions by block (ascending) to find the first one
          const sortedTxs = response.data.result.sort((a, b) => parseInt(a.blockNumber) - parseInt(b.blockNumber));
          
          // First transaction should be mint
          const firstTx = sortedTxs[0];
          if (firstTx.from.toLowerCase() === '0x0000000000000000000000000000000000000000') {
            log(`Found minter ${firstTx.to} for token ${tokenInfo.tokenId} from first transfer`);
            return firstTx.to;
          }
        }
      } catch (apiError) {
        log(`Error querying token transactions API: ${apiError.message}`);
      }
      
      // If nothing found, return null
      log(`Could not determine minter for token ${tokenInfo.tokenId}`);
      return null;
    } catch (err) {
      log(`Error getting token minter: ${err.message}`);
      return null;
    }
}

// Main function for royalty distribution
async function distributeRoyalties(manualTrigger = false) {
  log(`Starting royalty distribution process${manualTrigger ? ' (manual trigger)' : ''}`);
  
  // Create detailed report for return
  const report = {
    success: true,
    processedCount: 0,
    transactions: [], // Подробная информация о каждой обработанной транзакции
    errors: []        // Информация об ошибках
  };
  
  try {
    // Validate configuration
    validateConfig();
    
    // Set up provider and wallet
    const provider = new ethers.JsonRpcProvider(CONFIG.providerUrl);
    const wallet = new ethers.Wallet(CONFIG.privateKey, provider);
    
    // Load list of processed transactions
    const processedTransactions = await loadProcessedTransactions();
    
    // Get incoming royalty transactions
    const transactions = await getIncomingTransactions();
    log(`Found ${transactions.length} incoming transactions`);
    
    // Filter unprocessed transactions
    const newTransactions = transactions.filter(tx => !processedTransactions.includes(tx.hash));
    log(`Found ${newTransactions.length} new transactions to process`);
    
    // Process each new transaction
    for (const tx of newTransactions) {
      const txReport = {
        txHash: tx.hash,
        royaltyAmount: tx.value,
        status: 'processing'
      };
      
      try {
        log(`Processing transaction ${tx.hash} with value ${tx.value} ETH`);
        txReport.logTime = new Date().toISOString();
        
        // Get token information
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
        
        // Get token minter address
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
        
        // Check minter address validity
        if (!ethers.isAddress(minterAddress)) {
          log(`Invalid minter address: ${minterAddress}`);
          txReport.status = 'failed';
          txReport.error = 'Invalid minter address';
          report.errors.push(txReport);
          continue;
        }
        
        // Calculate royalty amount
        const royaltyAmount = ethers.parseEther(tx.value);
        const artistShare = royaltyAmount / 2n;
        
        // Check that amount is not too small
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
        
        // Send artist's share
        log(`Sending ${ethers.formatEther(artistPayment)} ETH to artist ${minterAddress}`);
        
        const artistTx = await wallet.sendTransaction({
          to: minterAddress,
          value: artistPayment,
          gasLimit: estimatedGas,
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        });
        
        txReport.paymentTxHash = artistTx.hash;
        
        // Wait for transaction confirmation with timeout
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
          
          // Add transaction to processed list in Redis
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
    
    // Update time of last run
    await updateLastRunTime();
    
    return report;
  } catch (err) {
    log(`Fatal error in royalty distribution: ${err.message}`);
    report.success = false;
    report.error = err.message;
    return report;
  }
}

// Function to check and run distribution by schedule
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

// Export functions
module.exports = {
  distributeRoyalties,
  manualDistribution: () => distributeRoyalties(true),
  checkAndRunDistribution,
  getRecentLogs
};

// Run script directly
if (require.main === module) {
  checkAndRunDistribution();
}