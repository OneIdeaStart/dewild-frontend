// src/hooks/useWhitelistFull.ts
import { useEffect, useState } from 'react';

export const useWhitelistFull = () => {
  const [isWhitelistFull, setIsWhitelistFull] = useState(false);

  useEffect(() => {
    const checkLimit = async () => {
      const response = await fetch('/api/whitelist/check');
      const data = await response.json();
      setIsWhitelistFull(!!data.stats?.isFull);
    };
    checkLimit();
  }, []);

  return isWhitelistFull;
};