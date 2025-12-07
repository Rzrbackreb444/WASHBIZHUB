import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'washbizhub_recently_viewed';
const MAX_ITEMS = 10;

function getStoredIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage not available or quota exceeded
  }
}

export function useRecentlyViewedListings() {
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => getStoredIds());

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setRecentlyViewedIds(getStoredIds());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addToRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewedIds((prevIds) => {
      const filtered = prevIds.filter((existingId) => existingId !== id);
      const newIds = [id, ...filtered].slice(0, MAX_ITEMS);
      setStoredIds(newIds);
      return newIds;
    });
  }, []);

  const getRecentlyViewed = useCallback((): string[] => {
    return recentlyViewedIds;
  }, [recentlyViewedIds]);

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewedIds([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // localStorage not available
      }
    }
  }, []);

  return {
    recentlyViewedIds,
    addToRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed,
  };
}
