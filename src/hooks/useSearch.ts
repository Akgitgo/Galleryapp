import { useCallback, useEffect } from 'react';
import { useGalleryStore } from '../store/galleryStore';
import { useDebounce } from './useDebounce';

/**
 * useSearch
 * Handles search input with debouncing and syncs to the gallery store.
 * The immediate value (searchQuery) is used for UI; the debounced value
 * (debouncedQuery) drives the actual filtering.
 */
export function useSearch() {
  const { searchQuery, setSearchQuery, setDebouncedQuery } = useGalleryStore();
  const debouncedQuery = useDebounce(searchQuery, 350);

  // Sync debounced value to store so selectors can use it
  useEffect(() => {
    setDebouncedQuery(debouncedQuery);
  }, [debouncedQuery, setDebouncedQuery]);

  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchQuery(text);
    },
    [setSearchQuery],
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, [setSearchQuery, setDebouncedQuery]);

  return {
    searchQuery,
    debouncedQuery,
    handleSearchChange,
    clearSearch,
    isSearching: searchQuery.trim().length > 0,
  };
}
