import { useCallback, useRef } from 'react';
import { useGalleryStore } from '../store/galleryStore';

const END_REACHED_THRESHOLD = 0.3; // Trigger at 30% from bottom

/**
 * usePagination
 * Provides FlatList handlers for pull-to-refresh and infinite scroll,
 * with deduplication guards to prevent double-fetching.
 */
export function usePagination() {
  const { fetchImages, loadMore, isLoadingMore, isRefreshing, hasMore } = useGalleryStore();
  const lastLoadMoreTime = useRef(0);

  const handleRefresh = useCallback(async () => {
    await fetchImages(true);
  }, [fetchImages]);

  /**
   * Called by FlatList's onEndReached.
   * Guards against:
   * 1. Concurrent loadMore calls
   * 2. Rapid successive triggers (< 500ms apart)
   */
  const handleEndReached = useCallback(async () => {
    if (!hasMore || isLoadingMore || isRefreshing) return;

    const now = Date.now();
    if (now - lastLoadMoreTime.current < 500) return;
    lastLoadMoreTime.current = now;

    await loadMore();
  }, [hasMore, isLoadingMore, isRefreshing, loadMore]);

  return {
    handleRefresh,
    handleEndReached,
    endReachedThreshold: END_REACHED_THRESHOLD,
    isRefreshing,
    isLoadingMore,
    hasMore,
  };
}
