// src/app/admin/components/ResetButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ResetButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleReset = async () => {
    // Show standard confirmation dialog
    const confirmed = window.confirm(
      'This action will reset all applications, NFTs, and prompt statuses. This cannot be undone. Are you sure?'
    );

    if (!confirmed) {
      return;
    }

    // Request admin key through standard prompt
    const adminKey = prompt('Enter admin key to confirm:');
    
    if (!adminKey) {
      alert('Admin key not provided. Operation cancelled.');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/admin/reset-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminKey }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset database');
      }
      
      // Show success message through standard alert
      alert(`Success: ${data.message || 'Database has been reset successfully'}`);
      
      // Reload page to update data
      window.location.reload();
    } catch (error: any) {
      // Show error message through standard alert
      alert(`Error: ${error.message || 'An error occurred while resetting the database'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleReset}
      disabled={isLoading}
      className="bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400"
    >
      {isLoading ? 'Resetting...' : 'Reset Database'}
    </Button>
  );
}