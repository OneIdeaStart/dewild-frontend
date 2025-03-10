// src/app/admin/royalties/page.tsx
'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';

interface LogItem {
  message: string;
  timestamp: string;
}

interface DistributionStats {
  timestamp: string;
  success: boolean;
  processedCount: number;
  transactions: any[];
  errors: any[];
  error?: string;
}

export default function RoyaltiesAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [distributionHistory, setDistributionHistory] = useState<DistributionStats[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);


  // Загрузка логов при монтировании компонента
  useEffect(() => {
    fetchLogs();
  }, []);

  // Функция для загрузки логов
  const fetchLogs = async () => {
    try {
      setIsLoadingLogs(true);
      
      const response = await fetch('/api/admin/royalties/distribute');
      
      if (!response.ok) {
        throw new Error('Failed to fetch logs');
      }
      
      const data = await response.json();
      
      if (data.logs) {
        setLogs(data.logs);
        
        // Анализируем логи для создания истории распределения
        const history: DistributionStats[] = [];
        let currentDistribution: Partial<DistributionStats> = {};
        
        data.logs.forEach((log: string) => {
          // Извлекаем временную метку из лога
          const timestamp = log.match(/\[(.*?)\]/)?.[1];
          
          // Определяем начало нового процесса распределения
          if (log.includes('Starting royalty distribution process')) {
            currentDistribution = {
              timestamp: timestamp || new Date().toISOString(),
              success: true,
              processedCount: 0,
              transactions: [],
              errors: []
            };
          }
          
          // Определяем конец процесса распределения
          if (log.includes('Royalty distribution process completed successfully') && currentDistribution.timestamp) {
            history.unshift(currentDistribution as DistributionStats);
            currentDistribution = {};
          }
          
          // Сохраняем ошибки
          if (log.includes('Fatal error in royalty distribution:') && currentDistribution.timestamp) {
            currentDistribution.success = false;
            const errorMessage = log.split('Fatal error in royalty distribution:')[1]?.trim();
            currentDistribution.error = errorMessage;
            history.unshift(currentDistribution as DistributionStats);
            currentDistribution = {};
          }
          
          // Отслеживаем количество обработанных транзакций
          if (log.includes('Payment sent to artist, tx hash:') && currentDistribution.processedCount !== undefined) {
            currentDistribution.processedCount += 1;
          }
        });
        
        setDistributionHistory(history);
      }
    } catch (err: any) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleDistributeRoyalties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/royalties/distribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to distribute royalties');
      }
      
      setResult(data);
      
      // Обновляем логи и историю
      setTimeout(() => {
        fetchLogs();
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDatabase = async () => {
    // Запрашиваем подтверждение
    const confirmed = window.confirm(
      'Are you sure you want to reset the royalty database? This will clear all processed transactions and logs!'
    );
    
    if (!confirmed) return;
    
    try {
      setIsResetting(true);
      setResetSuccess(null);
      
      const response = await fetch('/api/admin/royalties/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset royalty database');
      }
      
      setResetSuccess(data.message);
      
      // Обновляем логи и историю
      setTimeout(() => {
        fetchLogs();
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-4xl font-extrabold uppercase mb-6">Royalty Distribution</h1>
        
        <div className="bg-gray-100 p-6 rounded-lg mb-6">
          <p className="mb-4">
            This tool distributes royalties received by the platform to the artists. 
            It automatically sends 50% of the received amounts to the original creators of the NFTs.
          </p>
          
          <Button 
            onClick={handleDistributeRoyalties}
            disabled={isLoading}
            className="bg-black text-white hover:bg-gray-800 font-extrabold"
            size="lg"
          >
            {isLoading ? 'PROCESSING...' : 'DISTRIBUTE ROYALTIES'}
          </Button>
          <Button 
              onClick={handleResetDatabase}
              disabled={isResetting}
              className="bg-red-600 text-white hover:bg-red-700 font-extrabold"
              size="lg"
            >
              {isResetting ? 'RESETTING...' : 'RESET DATABASE'}
            </Button>
        </div>
        
        {error && (
          <div className="bg-red-100 p-4 rounded-lg border border-red-300 text-red-700 mb-6">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {resetSuccess && (
          <div className="bg-blue-100 p-4 rounded-lg border border-blue-300 text-blue-700 mb-6">
            <p className="font-bold">Reset successful:</p>
            <p>{resetSuccess}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-green-100 p-4 rounded-lg border border-green-300 text-green-700 mb-6">
            <p className="font-bold">Success:</p>
            <pre className="mt-2 bg-white p-3 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        {/* История распределения */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Distribution History</h2>
          
          {isLoadingLogs ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : distributionHistory.length > 0 ? (
            <div className="space-y-4">
              {distributionHistory.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border ${item.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                    <div className={`px-2 py-1 rounded text-white text-xs font-bold ${item.success ? 'bg-green-500' : 'bg-red-500'}`}>
                      {item.success ? 'SUCCESS' : 'FAILED'}
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="mb-1">Processed transactions: {item.processedCount}</p>
                    {item.error && <p className="text-red-600">Error: {item.error}</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No distribution history available.</p>
          )}
        </div>
        
        {/* Логи */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Logs</h2>
          
          {isLoadingLogs ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : logs.length > 0 ? (
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="border-b border-gray-700 py-1">
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No logs available.</p>
          )}
        </div>
      </div>
    </div>
  );
}