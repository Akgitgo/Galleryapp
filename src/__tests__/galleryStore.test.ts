/**
 * galleryStore tests
 * Mocks the API and storageService to test store logic in isolation.
 */

import { useGalleryStore, selectFilteredImages, selectIsFavorite } from '../store/galleryStore';
import { PicsumImage } from '../types';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockImages: PicsumImage[] = [
  { id: '1', author: 'Alejandro Escamilla', width: 100, height: 100, url: 'u1', download_url: 'd1' },
  { id: '2', author: 'Ben Moore',           width: 100, height: 100, url: 'u2', download_url: 'd2' },
  { id: '3', author: 'Nano Anderson',        width: 100, height: 100, url: 'u3', download_url: 'd3' },
  { id: '4', author: 'Paul Jarvis',          width: 100, height: 100, url: 'u4', download_url: 'd4' },
  { id: '5', author: 'Zoe Rivel',            width: 100, height: 100, url: 'u5', download_url: 'd5' },
];

jest.mock('../api/picsumApi', () => ({
  fetchImages: jest.fn(() => Promise.resolve(mockImages)),
  PAGE_LIMIT: 20,
}));

jest.mock('../services/storageService', () => ({
  storageService: {
    getFavorites: jest.fn(() => Promise.resolve([])),
    saveFavorites: jest.fn(() => Promise.resolve()),
  },
}));

import { fetchImages as mockFetch } from '../api/picsumApi';
import { storageService } from '../services/storageService';

// Reset store before each test
beforeEach(() => {
  useGalleryStore.setState({
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
  });
  jest.clearAllMocks();
});

// ─── fetchImages ──────────────────────────────────────────────────────────────

describe('galleryStore.fetchImages', () => {
  it('loads images and updates state', async () => {
    await useGalleryStore.getState().fetchImages();

    const state = useGalleryStore.getState();
    expect(state.allImages).toHaveLength(5);
    expect(state.isLoading).toBe(false);
    expect(state.currentPage).toBe(1);
  });

  it('does not re-fetch if images already loaded', async () => {
    useGalleryStore.setState({ allImages: mockImages });
    await useGalleryStore.getState().fetchImages();

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sets error state when API fails', async () => {
    (mockFetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    await useGalleryStore.getState().fetchImages();

    expect(useGalleryStore.getState().error).toBeTruthy();
    expect(useGalleryStore.getState().isLoading).toBe(false);
  });

  it('refreshes and replaces images when refresh=true', async () => {
    useGalleryStore.setState({ allImages: mockImages, currentPage: 3 });
    await useGalleryStore.getState().fetchImages(true);

    const state = useGalleryStore.getState();
    expect(state.currentPage).toBe(1);
    expect(state.allImages).toHaveLength(5);
    expect(state.isRefreshing).toBe(false);
  });
});

// ─── toggleFavorite ───────────────────────────────────────────────────────────

describe('galleryStore.toggleFavorite', () => {
  const EMAIL = 'test@test.com';

  it('adds image id to favorites', async () => {
    (storageService.saveFavorites as jest.Mock).mockResolvedValue(undefined);

    await useGalleryStore.getState().toggleFavorite('1', EMAIL);
    expect(useGalleryStore.getState().favorites).toContain('1');
  });

  it('removes image id if already favorited', async () => {
    useGalleryStore.setState({ favorites: ['1', '2', '3'] });
    (storageService.saveFavorites as jest.Mock).mockResolvedValue(undefined);

    await useGalleryStore.getState().toggleFavorite('2', EMAIL);
    expect(useGalleryStore.getState().favorites).not.toContain('2');
    expect(useGalleryStore.getState().favorites).toHaveLength(2);
  });

  it('rolls back optimistic update on storage failure', async () => {
    useGalleryStore.setState({ favorites: ['1'] });
    (storageService.saveFavorites as jest.Mock).mockRejectedValueOnce(new Error('Storage fail'));

    await useGalleryStore.getState().toggleFavorite('1', EMAIL);
    // Should rollback: '1' should still be in favorites
    expect(useGalleryStore.getState().favorites).toContain('1');
  });
});

// ─── setFilterType ────────────────────────────────────────────────────────────

describe('galleryStore.setFilterType', () => {
  it('updates filter type in state', () => {
    useGalleryStore.getState().setFilterType('a-m');
    expect(useGalleryStore.getState().filterType).toBe('a-m');
  });
});

// ─── setSearchQuery / setDebouncedQuery ───────────────────────────────────────

describe('galleryStore search', () => {
  it('updates searchQuery in state', () => {
    useGalleryStore.getState().setSearchQuery('ben');
    expect(useGalleryStore.getState().searchQuery).toBe('ben');
  });

  it('updates debouncedQuery in state', () => {
    useGalleryStore.getState().setDebouncedQuery('ben');
    expect(useGalleryStore.getState().debouncedQuery).toBe('ben');
  });
});

// ─── selectFilteredImages ─────────────────────────────────────────────────────

describe('selectFilteredImages', () => {
  beforeEach(() => {
    useGalleryStore.setState({ allImages: mockImages });
  });

  it('returns all images when filter=all and query empty', () => {
    useGalleryStore.setState({ filterType: 'all', debouncedQuery: '' });
    const result = selectFilteredImages(useGalleryStore.getState());
    expect(result).toHaveLength(5);
  });

  it("filters a-m correctly", () => {
    useGalleryStore.setState({ filterType: 'a-m', debouncedQuery: '' });
    const result = selectFilteredImages(useGalleryStore.getState());
    result.forEach((img) => {
      expect(img.author[0].toLowerCase() <= 'm').toBe(true);
    });
  });

  it("filters n-z correctly", () => {
    useGalleryStore.setState({ filterType: 'n-z', debouncedQuery: '' });
    const result = selectFilteredImages(useGalleryStore.getState());
    result.forEach((img) => {
      expect(img.author[0].toLowerCase() >= 'n').toBe(true);
    });
  });

  it('applies search on top of filter', () => {
    useGalleryStore.setState({ filterType: 'a-m', debouncedQuery: 'ben' });
    const result = selectFilteredImages(useGalleryStore.getState());
    expect(result).toHaveLength(1);
    expect(result[0].author).toBe('Ben Moore');
  });

  it('returns empty for non-matching search', () => {
    useGalleryStore.setState({ filterType: 'all', debouncedQuery: 'zzznomatch' });
    const result = selectFilteredImages(useGalleryStore.getState());
    expect(result).toHaveLength(0);
  });
});

// ─── selectIsFavorite ─────────────────────────────────────────────────────────

describe('selectIsFavorite', () => {
  it('returns true when image is in favorites', () => {
    useGalleryStore.setState({ favorites: ['1', '3'] });
    expect(selectIsFavorite('1')(useGalleryStore.getState())).toBe(true);
    expect(selectIsFavorite('3')(useGalleryStore.getState())).toBe(true);
  });

  it('returns false when image is not in favorites', () => {
    useGalleryStore.setState({ favorites: ['1'] });
    expect(selectIsFavorite('99')(useGalleryStore.getState())).toBe(false);
  });
});

// ─── initFavorites ────────────────────────────────────────────────────────────

describe('galleryStore.initFavorites', () => {
  it('loads favorites from storage and marks initialized', async () => {
    (storageService.getFavorites as jest.Mock).mockResolvedValue(['10', '20']);
    await useGalleryStore.getState().initFavorites('user@test.com');

    expect(useGalleryStore.getState().favorites).toEqual(['10', '20']);
    expect(useGalleryStore.getState().favoritesInitialized).toBe(true);
  });

  it('sets initialized even on storage error', async () => {
    (storageService.getFavorites as jest.Mock).mockRejectedValueOnce(new Error('fail'));
    await useGalleryStore.getState().initFavorites('user@test.com');

    expect(useGalleryStore.getState().favoritesInitialized).toBe(true);
  });
});

// ─── resetGallery ─────────────────────────────────────────────────────────────

describe('galleryStore.resetGallery', () => {
  it('resets all gallery state except favorites', () => {
    useGalleryStore.setState({
      allImages: mockImages,
      currentPage: 3,
      searchQuery: 'test',
      filterType: 'n-z',
      error: 'some error',
    });

    useGalleryStore.getState().resetGallery();

    const state = useGalleryStore.getState();
    expect(state.allImages).toHaveLength(0);
    expect(state.currentPage).toBe(0);
    expect(state.searchQuery).toBe('');
    expect(state.filterType).toBe('all');
    expect(state.error).toBeNull();
  });
});
