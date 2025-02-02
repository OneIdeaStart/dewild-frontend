// src/lib/api.ts
export async function checkWhitelist(address: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/collab/check?address=${address}`);
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format');
      }
  
      const data = await response.json();
      return data.isWhitelisted;
    } catch (error) {
      console.error('Error checking whitelist:', error);
      return false;
    }
  }
  
  export async function joinWhitelist(address: string): Promise<boolean> {
    try {
      const response = await fetch('/api/whitelist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ address }),
      });
  
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format');
      }
  
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error joining whitelist:', error);
      return false;
    }
  }