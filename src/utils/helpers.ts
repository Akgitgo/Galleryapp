import { PicsumImage, FilterType } from '../types';

// ─── String helpers ───────────────────────────────────────────────────────────

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const formatName = (name: string): string =>
  name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(capitalize)
    .join(' ');

export const truncate = (str: string, maxLength: number): string =>
  str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;

export const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

// ─── Image URL helpers ────────────────────────────────────────────────────────

export const getThumbnailUrl = (imageId: string, width = 400, height = 300): string =>
  `https://picsum.photos/id/${imageId}/${width}/${height}`;

export const getFullSizeUrl = (imageId: string): string =>
  `https://picsum.photos/id/${imageId}/1200/800`;

export const getDownloadUrl = (image: PicsumImage): string =>
  image.download_url;

// ─── Filter & search helpers ──────────────────────────────────────────────────

export const applyFilter = (images: PicsumImage[], filter: FilterType): PicsumImage[] => {
  if (filter === 'all') return images;

  return images.filter((img) => {
    const firstChar = img.author.trim()[0]?.toLowerCase() ?? '';
    if (filter === 'a-m') return firstChar >= 'a' && firstChar <= 'm';
    if (filter === 'n-z') return firstChar >= 'n' && firstChar <= 'z';
    return true;
  });
};

export const applySearch = (images: PicsumImage[], query: string): PicsumImage[] => {
  if (!query.trim()) return images;
  const lower = query.toLowerCase().trim();
  return images.filter((img) => img.author.toLowerCase().includes(lower));
};

export const applyFilterAndSearch = (
  images: PicsumImage[],
  filter: FilterType,
  query: string,
): PicsumImage[] => {
  return applySearch(applyFilter(images, filter), query);
};

// ─── ID generation ────────────────────────────────────────────────────────────

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

export const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
};

// ─── Network helpers ──────────────────────────────────────────────────────────

export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(delay * (i + 1));
    }
  }
  throw new Error('Max retries exceeded');
};

// ─── Number helpers ───────────────────────────────────────────────────────────

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
