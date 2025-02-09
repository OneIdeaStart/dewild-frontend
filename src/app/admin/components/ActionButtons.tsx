// src/app/admin/components/ActionButtons.tsx
'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ActionButtonsProps {
  id: string;
  status: string;
}

export default function ActionButtons({ id, status }: ActionButtonsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this application?')) {
      return;
    }
  
    console.log('Starting delete for application with ID:', id);
    try {
      const url = `/api/admin/applications/${id}`;
      console.log('Making DELETE request to:', url);
  
      const response = await fetch(url, {
        method: 'DELETE',
      });
  
      console.log('Delete response:', {
        status: response.status,
        ok: response.ok,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error details:', errorData);
        throw new Error(errorData.error || 'Failed to delete application');
      }
  
      router.refresh();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} application`);
      }

      router.refresh();
    } catch (error) {
      console.error(`${action} error:`, error);
    }
  };

  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={() => handleAction('approve')}
        className={`px-3 py-1 rounded text-xs font-medium 
          ${status === 'approved' 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
        disabled={status === 'approved'}
      >
        Approve
      </button>

      <button
        onClick={() => handleAction('reject')}
        className={`px-3 py-1 rounded text-xs font-medium
          ${status === 'rejected' 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
        disabled={status === 'rejected'}
      >
        Reject
      </button>

      <button
        onClick={handleDelete}
        className="text-gray-600 hover:text-gray-900"
        title="Delete"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}