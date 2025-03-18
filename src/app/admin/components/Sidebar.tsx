// src/app/admin/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Sidebar() {
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
    <div className="w-48 bg-white shadow min-h-screen">
      <nav className="mt-5 px-2">
        <Link 
          href="/admin" 
          className="group flex items-center px-2 py-2 text-base leading-6 font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <Link 
          href="/admin/applications" 
          className="mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium text-gray-900 hover:text-gray-900 hover:bg-gray-100"
        >
          Applications
        </Link>
        
        {/* Reset Database button */}
        <button 
          onClick={handleReset}
          disabled={isLoading}
          className="mt-6 w-full group flex items-center px-2 py-2 text-base leading-6 font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:bg-red-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Resetting...' : 'Reset Database'}
        </button>
      </nav>
    </div>
  );
}