import { useState, useCallback } from 'react';
import { StorageResult } from '../types';
import { storageService } from '../services/storageService';

/**
 * useStorage
 * Provides a simple React-friendly wrapper for common storage operations
 * with loading and error state management.
 */
export function useStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLoading = useCallback(
    async <T>(operation: () => Promise<T>): Promise<StorageResult<T>> => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await operation();
        return { data, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Storage operation failed';
        setError(message);
        return { data: null, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const getFavorites = useCallback(
    (email: string) => withLoading(() => storageService.getFavorites(email)),
    [withLoading],
  );

  const saveFavorites = useCallback(
    (email: string, ids: string[]) =>
      withLoading(() => storageService.saveFavorites(email, ids).then(() => ids)),
    [withLoading],
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    getFavorites,
    saveFavorites,
    clearError,
    storageService, // Expose for direct use when needed
  };
}
