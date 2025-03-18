// src/app/admin/components/ActionButtons.tsx
'use client';

import { useState } from 'react';
import { Trash2, Check, X, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface ActionButtonsProps {
  id: string;
  status: string;
}

export default function ActionButtons({ id, status }: ActionButtonsProps) {
  const router = useRouter();
  const [isContractProcessing, setIsContractProcessing] = useState(false);
  const [contractStatus, setContractStatus] = useState<'idle' | 'success' | 'warning' | 'error'>('idle');
  const [contractMessage, setContractMessage] = useState('');

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

  const handleNFTAction = async (action: 'approve_nft' | 'reject_nft') => {
    // Show loading indicator only for approve_nft
    if (action === 'approve_nft') {
      setIsContractProcessing(true);
      setContractStatus('idle');
      setContractMessage('');
    }
  
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setContractStatus('error');
        setContractMessage(data.error || `Failed to ${action.replace('_', ' ')}`);
        throw new Error(`Failed to ${action.replace('_', ' ')}. ${data.error || ''}`);
      }
  
      // Check for warnings
      if (data.warning) {
        setContractStatus('warning');
        setContractMessage(data.warning);
      } else if (data.signature) {
        // If signature is successfully received
        setContractStatus('success');
        setContractMessage(`NFT approved, signature: ${data.signature.substring(0, 10)}...`);
      } else {
        setContractStatus('success');
        setContractMessage('NFT status updated successfully');
      }
  
      // Update UI after 3 seconds
      setTimeout(() => {
        router.refresh();
      }, 3000);
    } catch (error) {
      console.error(`${action} error:`, error);
      setContractStatus('error');
      
      // Leave error indicator on screen
      setTimeout(() => {
        setIsContractProcessing(false);
      }, 5000);
    }
  };

  return (
    <div className="flex flex-wrap justify-start gap-2 items-center">
      {/* Buttons for NFT statuses */}
      {['nft_pending', 'nft_approved', 'nft_rejected'].includes(status) && (
        <>
          <button
            onClick={() => handleNFTAction('approve_nft')}
            className={`px-3 py-1 rounded text-xs font-medium flex items-center 
              ${status === 'nft_approved' 
                ? 'bg-green-200 text-green-800' // Bright color for active state
                : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            disabled={isContractProcessing}
          >
            {status === 'nft_approved' && <Check className="w-3 h-3 mr-1" />}
            {isContractProcessing ? (
              <>
                {contractStatus === 'idle' && (
                  <span className="mr-1 inline-block h-3 w-3 rounded-full border-2 border-green-800 border-t-transparent animate-spin"></span>
                )}
                {contractStatus === 'success' && (
                  <Check className="w-3 h-3 mr-1 text-green-800" />
                )}
                {contractStatus === 'warning' && (
                  <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
                )}
                {contractStatus === 'error' && (
                  <X className="w-3 h-3 mr-1 text-red-600" />
                )}
              </>
            ) : null}
            Approve NFT
          </button>

          {/* Show message if exists */}
          {contractMessage && (
            <div className={`text-xs px-2 py-1 rounded-lg mt-1 ${
              contractStatus === 'error' ? 'bg-red-100 text-red-800' : 
              contractStatus === 'warning' ? 'bg-amber-100 text-amber-800' : 
              'bg-green-100 text-green-800'
            }`}>
              {contractMessage}
            </div>
          )}

          <button
            onClick={() => handleNFTAction('reject_nft')}
            className={`px-3 py-1 rounded text-xs font-medium
              ${status === 'nft_rejected' 
                ? 'bg-red-200 text-red-800' // Bright color for active state
                : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
            disabled={isContractProcessing}
          >
            {status === 'nft_rejected' && <X className="w-3 h-3 inline mr-1" />}
            Reject NFT
          </button>
        </>
      )}
  
      {/* Buttons for regular statuses (including approved) */}
      {['pending', 'approved', 'rejected', 'prompt_received'].includes(status) && (
        <>
          <button
            onClick={() => handleAction('approve')}
            className={`px-3 py-1 rounded text-xs font-medium
              ${status === 'approved' 
                ? 'bg-green-200 text-green-800' // Bright color for active state
                : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
          >
            {status === 'approved' && <Check className="w-3 h-3 inline mr-1" />}
            Approve
          </button>
          <button
            onClick={() => handleAction('reject')}
            className={`px-3 py-1 rounded text-xs font-medium
              ${status === 'rejected' 
                ? 'bg-red-200 text-red-800' // Bright color for active state
                : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
          >
            {status === 'rejected' && <X className="w-3 h-3 inline mr-1" />}
            Reject
          </button>
        </>
      )}
  
      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="text-gray-600 hover:text-gray-900"
        title="Delete"
        disabled={isContractProcessing}
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}