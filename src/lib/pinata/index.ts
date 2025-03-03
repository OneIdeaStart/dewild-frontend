// src/lib/pinata/index.ts
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';

/**
 * Загружает файл в IPFS через Pinata
 * @param file Бинарные данные файла
 * @param fileName Имя файла
 * @param metadata Метаданные для Pinata
 * @returns CID хэш файла
 */
// src/lib/pinata/index.ts - исправление обработки ошибки
export const uploadFileToPinata = async (
    file: Buffer,
    fileName: string,
    metadata: Record<string, any> = {}
  ): Promise<string> => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Missing Pinata API keys');
    }
  
    console.log('Starting upload to Pinata, file size:', file.length, 'bytes');
  
    try {
      const formData = new FormData();
      
      // Создаем Blob из Buffer
      const blob = new Blob([file]);
      formData.append('file', blob, fileName);
      
      // Добавляем метаданные с временной меткой для уникальности
      const pinataMetadata = {
        name: fileName,
        keyvalues: {
          timestamp: Date.now().toString(),
          random: Math.random().toString()
        },
        ...metadata
      };
      console.log('Pinata metadata:', pinataMetadata);
      
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
      
      // Опции для Pinata
      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1
      }));
  
      console.log('Sending request to Pinata API...');
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': PINATA_API_KEY!,
          'pinata_secret_api_key': PINATA_SECRET_KEY!
        },
        body: formData
      });
  
      console.log('Pinata response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pinata error response:', errorText);
        throw new Error(`Failed to upload to Pinata: ${response.statusText}, details: ${errorText}`);
      }
  
      const responseText = await response.text();
      console.log('Pinata response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse Pinata response as JSON:', e);
        throw new Error('Invalid response from Pinata');
      }
      
      console.log('Successfully uploaded to Pinata, CID:', data.IpfsHash);
      return data.IpfsHash;
    } catch (error: any) { // Указываем тип 'any' для переменной error
      console.error('Failed to upload to Pinata:', error);
      throw new Error(`Failed to upload file to IPFS: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Изменения в функции uploadJsonToPinata
  export const uploadJsonToPinata = async (
    json: Record<string, any>,
    fileName: string
  ): Promise<string> => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Missing Pinata API keys');
    }
  
    try {
      // Добавляем временную метку для уникальности
      const pinataContent = {
        ...json,
        _metadata: {
          timestamp: Date.now(),
          random: Math.random()
        }
      };
  
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        },
        body: JSON.stringify({
          pinataContent,
          pinataMetadata: {
            name: fileName,
            keyvalues: {
              timestamp: Date.now().toString(),
              random: Math.random().toString()
            }
          }
        })
      });
  
      if (!response.ok) {
        throw new Error(`Failed to upload JSON to Pinata: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.IpfsHash;
    } catch (error) {
      console.error('Failed to upload JSON to Pinata:', error);
      throw new Error('Failed to upload JSON to IPFS');
    }
  };  

/**
 * Формирует URL для доступа к файлу через Pinata Gateway
 * @param ipfsHash CID хэш файла
 * @returns Полный URL к файлу
 */
export const getPinataUrl = (ipfsHash: string): string => {
  return `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
};