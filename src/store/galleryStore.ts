import { create } from 'zustand';
import { PicsumImage, FilterType } from '../types';
import { fetchImages as apiFetchImages, PAGE_LIMIT } from '../api/picsumApi';
import { storageService } from '../services/storageService';
import { applyFilterAndSearch } from '../utils/helpers';

interface GalleryState {
  // Raw image data
  allImages: PicsumImage[];
  currentPage: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;

  // Favorites (image IDs)
  favorites: string[];
  favoritesInitialized: boolean;

  // Search & filter
  searchQuery: string;
  filterType: FilterType;
  debouncedQuery: string;

  // Actions
  fetchImages: (refresh?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  toggleFavorite: (imageId: string, userEmail: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setDebouncedQuery: (query: string) => void;
  setFilterType: (filter: FilterType) => void;
  initFavorites: (userEmail: string) => Promise<void>;
  clearError: () => void;
  resetGallery: () => void;
}

export const useGalleryStore = create<GalleryState>((set, get) => ({
  allImages: [],
  currentPage: 0,
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  hasMore: true,
  error: null,
  favorites: [],
  favoritesInitialized: false,
  searchQuery: '',
  filterType: 'all',
  debouncedQuery: '',

  fetchImages: async (refresh = false) => {
    const state = get();

    if (refresh) {
      set({ isRefreshing: true, error: null });
    } else {
      if (state.isLoading || state.allImages.length > 0) return;
      set({ isLoading: true, error: null });
    }

    try {
      const page = 1;
      const images = await apiFetchImages(page);

      set({
        allImages: images,
        currentPage: page,
        hasMore: images.length >= PAGE_LIMIT,
        isLoading: false,
        isRefreshing: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load images. Please try again.';
      set({ isLoading: false, isRefreshing: false, error: message });
    }
  },

  loadMore: async () => {
    const state = get();

    // Guard: no duplicate calls while loading, and only if more available
    if (state.isLoadingMore || state.isRefreshing || !state.hasMore) return;

    // If we have active search/filter and results < PAGE_LIMIT, no point fetching more
    const filtered = applyFilterAndSearch(state.allImages, state.filterType, state.debouncedQuery);
    if (filtered.length < state.allImages.length && !state.hasMore) return;

    set({ isLoadingMore: true });
    try {
      const nextPage = state.currentPage + 1;
      const newImages = await apiFetchImages(nextPage);

      if (newImages.length === 0) {
        set({ hasMore: false, isLoadingMore: false });
        return;
      }

      // Deduplicate by ID
      const existingIds = new Set(state.allImages.map((img) => img.id));
      const uniqueNew = newImages.filter((img) => !existingIds.has(img.id));

      set({
        allImages: [...state.allImages, ...uniqueNew],
        currentPage: nextPage,
        hasMore: newImages.length >= PAGE_LIMIT,
        isLoadingMore: false,
      });
    } catch (err) {
      set({ isLoadingMore: false });
      // Don't set error on loadMore failure; soft fail
      console.error('[GalleryStore] loadMore error:', err);
    }
  },

  toggleFavorite: async (imageId, userEmail) => {
    const { favorites } = get();
    const updated = favorites.includes(imageId)
      ? favorites.filter((id) => id !== imageId)
      : [...favorites, imageId];

    // Optimistic update
    set({ favorites: updated });

    try {
      await storageService.saveFavorites(userEmail, updated);
    } catch {
      // Rollback on failure
      set({ favorites });
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setDebouncedQuery: (query) => {
    set({ debouncedQuery: query });
  },

  setFilterType: (filter) => {
    set({ filterType: filter });
  },

  initFavorites: async (userEmail) => {
    try {
      const favorites = await storageService.getFavorites(userEmail);
      set({ favorites, favoritesInitialized: true });
    } catch {
      set({ favoritesInitialized: true });
    }
  },

  clearError: () => set({ error: null }),

  resetGallery: () => {
    set({
      allImages: [],
      currentPage: 0,
      isLoading: false,
      isRefreshing: false,
      isLoadingMore: false,
      hasMore: true,
      error: null,
      searchQuery: '',
      debouncedQuery: '',
      filterType: 'all',
    });
  },
}));

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectFilteredImages = (state: GalleryState): PicsumImage[] =>
  applyFilterAndSearch(state.allImages, state.filterType, state.debouncedQuery);

export const selectFavoriteImages = (state: GalleryState): PicsumImage[] => {
  const filtered = applyFilterAndSearch(
    state.allImages.filter((img) => state.favorites.includes(img.id)),
    'all',
    state.debouncedQuery,
  );
  return filtered;
};

export const selectIsFavorite = (imageId: string) => (state: GalleryState): boolean =>
  state.favorites.includes(imageId);
