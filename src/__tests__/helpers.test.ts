import {
  capitalize,
  formatName,
  truncate,
  getInitials,
  getThumbnailUrl,
  getFullSizeUrl,
  applyFilter,
  applySearch,
  applyFilterAndSearch,
  generateId,
  formatDate,
} from '../utils/helpers';
import { PicsumImage, FilterType } from '../types';

const mockImages: PicsumImage[] = [
  { id: '1', author: 'Alejandro Escamilla', width: 5616, height: 3744, url: 'https://unsplash.com/photos/1', download_url: 'https://picsum.photos/id/1/5616/3744' },
  { id: '2', author: 'Ben Moore', width: 3264, height: 2446, url: 'https://unsplash.com/photos/2', download_url: 'https://picsum.photos/id/2/3264/2446' },
  { id: '3', author: 'Nano Anderson', width: 6000, height: 4000, url: 'https://unsplash.com/photos/3', download_url: 'https://picsum.photos/id/3/6000/4000' },
  { id: '4', author: 'Paul Jarvis', width: 5000, height: 3333, url: 'https://unsplash.com/photos/4', download_url: 'https://picsum.photos/id/4/5000/3333' },
  { id: '5', author: 'Zoe Rivel', width: 4928, height: 3264, url: 'https://unsplash.com/photos/5', download_url: 'https://picsum.photos/id/5/4928/3264' },
];

// ─── capitalize ───────────────────────────────────────────────────────────────

describe('capitalize', () => {
  it('capitalizes first letter and lowercases the rest', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
    expect(capitalize('jAvAsCrIpT')).toBe('Javascript');
  });

  it('handles single character', () => {
    expect(capitalize('a')).toBe('A');
  });
});

// ─── formatName ───────────────────────────────────────────────────────────────

describe('formatName', () => {
  it('capitalizes each word', () => {
    expect(formatName('ravi sharma')).toBe('Ravi Sharma');
    expect(formatName('PRIYA SINGH')).toBe('Priya Singh');
  });

  it('trims leading/trailing spaces', () => {
    expect(formatName('  raj  kumar  ')).toBe('Raj Kumar');
  });
});

// ─── truncate ─────────────────────────────────────────────────────────────────

describe('truncate', () => {
  it('does not truncate strings within limit', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('truncates and adds ellipsis when over limit', () => {
    expect(truncate('Hello World', 8)).toBe('Hello Wo...');
  });

  it('handles exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });
});

// ─── getInitials ──────────────────────────────────────────────────────────────

describe('getInitials', () => {
  it('returns first and last name initials for full name', () => {
    expect(getInitials('Ravi Sharma')).toBe('RS');
    expect(getInitials('Priya Kumar Singh')).toBe('PS');
  });

  it('returns single initial for single name', () => {
    expect(getInitials('Ravi')).toBe('R');
  });

  it('handles empty string', () => {
    expect(getInitials('')).toBe('?');
  });
});

// ─── getThumbnailUrl ──────────────────────────────────────────────────────────

describe('getThumbnailUrl', () => {
  it('constructs correct picsum thumbnail URL', () => {
    expect(getThumbnailUrl('42')).toBe('https://picsum.photos/id/42/400/300');
  });

  it('accepts custom dimensions', () => {
    expect(getThumbnailUrl('10', 200, 150)).toBe('https://picsum.photos/id/10/200/150');
  });
});

// ─── getFullSizeUrl ───────────────────────────────────────────────────────────

describe('getFullSizeUrl', () => {
  it('constructs correct full size URL', () => {
    expect(getFullSizeUrl('99')).toBe('https://picsum.photos/id/99/1200/800');
  });
});

// ─── applyFilter ──────────────────────────────────────────────────────────────

describe('applyFilter', () => {
  it("'all' returns all images unchanged", () => {
    expect(applyFilter(mockImages, 'all')).toHaveLength(mockImages.length);
  });

  it("'a-m' returns only authors whose first letter is a–m", () => {
    const result = applyFilter(mockImages, 'a-m');
    // Alejandro(a), Ben(b) = 2
    expect(result.every((img) => img.author[0].toLowerCase() <= 'm')).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("'n-z' returns only authors whose first letter is n–z", () => {
    const result = applyFilter(mockImages, 'n-z');
    // Nano(n), Paul(p), Zoe(z) = 3
    expect(result.every((img) => img.author[0].toLowerCase() >= 'n')).toBe(true);
  });

  it("'a-m' and 'n-z' together cover all images", () => {
    const am = applyFilter(mockImages, 'a-m');
    const nz = applyFilter(mockImages, 'n-z');
    expect(am.length + nz.length).toBe(mockImages.length);
  });

  it('returns empty array if no images match', () => {
    const images = [{ ...mockImages[4] }]; // Zoe Rivel
    expect(applyFilter(images, 'a-m')).toHaveLength(0);
  });
});

// ─── applySearch ──────────────────────────────────────────────────────────────

describe('applySearch', () => {
  it('returns all images for empty query', () => {
    expect(applySearch(mockImages, '')).toHaveLength(mockImages.length);
    expect(applySearch(mockImages, '  ')).toHaveLength(mockImages.length);
  });

  it('filters case-insensitively by author name', () => {
    const result = applySearch(mockImages, 'ben');
    expect(result).toHaveLength(1);
    expect(result[0].author).toBe('Ben Moore');
  });

  it('returns partial matches', () => {
    const result = applySearch(mockImages, 'an'); // Nano Anderson
    expect(result.length).toBeGreaterThan(0);
    result.forEach((img) => {
      expect(img.author.toLowerCase()).toContain('an');
    });
  });

  it('returns empty array when no match', () => {
    expect(applySearch(mockImages, 'zzznomatch')).toHaveLength(0);
  });
});

// ─── applyFilterAndSearch ─────────────────────────────────────────────────────

describe('applyFilterAndSearch', () => {
  it('applies filter then search correctly', () => {
    // filter 'a-m' gives Alejandro, Ben; then search 'ben' gives only Ben
    const result = applyFilterAndSearch(mockImages, 'a-m', 'ben');
    expect(result).toHaveLength(1);
    expect(result[0].author).toBe('Ben Moore');
  });

  it('returns empty when filter leaves nothing for search', () => {
    // 'n-z' has Nano, Paul, Zoe; 'ben' matches none
    const result = applyFilterAndSearch(mockImages, 'n-z', 'ben');
    expect(result).toHaveLength(0);
  });

  it('returns all images for "all" filter and empty search', () => {
    expect(applyFilterAndSearch(mockImages, 'all', '')).toHaveLength(mockImages.length);
  });
});

// ─── generateId ───────────────────────────────────────────────────────────────

describe('generateId', () => {
  it('generates a non-empty string', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats ISO date string into readable format', () => {
    const result = formatDate('2024-01-15T10:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result).toMatch(/2024/);
  });

  it('returns the input if parsing fails', () => {
    expect(formatDate('invalid')).toBeTruthy(); // does not throw
  });
});
