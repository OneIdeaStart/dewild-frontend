// src/lib/pinata/index.ts
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || 'https://gateway.pinata.cloud';

/**
 * Uploads file to IPFS via Pinata
 * @param file Binary file data
 * @param fileName File name
 * @param metadata Metadata for Pinata
 * @returns CID hash of file
 */
// src/lib/pinata/index.ts - fix error handling
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
      
      // Create Blob from Buffer
      const blob = new Blob([file]);
      formData.append('file', blob, fileName);
      
      // Add metadata with timestamp for uniqueness
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
      
      // Options for Pinata
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
    } catch (error: any) { // Specify 'any' type for error variable
      console.error('Failed to upload to Pinata:', error);
      throw new Error(`Failed to upload file to IPFS: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Changes in uploadJsonToPinata function
  export const uploadJsonToPinata = async (
    json: Record<string, any>,
    fileName: string
  ): Promise<string> => {
    if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
      throw new Error('Missing Pinata API keys');
    }
  
    try {
      // Add timestamp for uniqueness
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
 * Forms URL for accessing file via Pinata Gateway
 * @param ipfsHash CID hash of file
 * @returns Full URL to file
 */
export const getPinataUrl = (ipfsHash: string): string => {
  return `${PINATA_GATEWAY}/ipfs/${ipfsHash}`;
};