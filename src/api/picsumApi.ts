import { PicsumImage } from '../types';

const BASE_URL = 'https://picsum.photos/v2';
const PAGE_LIMIT = 20;
const REQUEST_TIMEOUT = 10_000;

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch a page of images from Picsum Photos.
 * @param page - 1-indexed page number
 * @param limit - items per page (default 20)
 */
export const fetchImages = async (
  page: number,
  limit: number = PAGE_LIMIT,
): Promise<PicsumImage[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const url = `${BASE_URL}/list?page=${page}&limit=${limit}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new ApiError(
        `Failed to fetch images: ${response.statusText}`,
        response.status,
      );
    }

    const data: PicsumImage[] = await response.json();
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if ((err as Error).name === 'AbortError') {
      throw new ApiError('Request timed out. Please check your internet connection.');
    }
    throw new ApiError(
      'Network error. Please check your internet connection and try again.',
    );
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Fetch details for a single image by ID.
 */
export const fetchImageById = async (imageId: string): Promise<PicsumImage> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${BASE_URL}/id/${imageId}/info`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new ApiError(`Image not found`, response.status);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Failed to fetch image details.');
  } finally {
    clearTimeout(timeoutId);
  }
};

export { PAGE_LIMIT, ApiError };
