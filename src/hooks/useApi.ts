import { useState, useCallback, useRef } from 'react';
import { ApiState } from '../types';

/**
 * useApi
 * Generic hook for one-off API calls with loading/error state.
 * For paginated gallery data, use the galleryStore instead.
 *
 * @example
 * const { data, isLoading, error, execute } = useApi(fetchImageById);
 * await execute('42');
 */
export function useApi<TArgs extends unknown[], TReturn>(
  apiFunction: (...args: TArgs) => Promise<TReturn>,
) {
  const [state, setState] = useState<ApiState<TReturn>>({
    data: null,
    isLoading: false,
    error: null,
  });

  // Track whether the component is still mounted to avoid state updates after unmount
  const isMountedRef = useRef(true);

  const execute = useCallback(
    async (...args: TArgs): Promise<TReturn | null> => {
      setState({ data: null, isLoading: true, error: null });
      try {
        const result = await apiFunction(...args);
        if (isMountedRef.current) {
          setState({ data: result, isLoading: false, error: null });
        }
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        if (isMountedRef.current) {
          setState({ data: null, isLoading: false, error: message });
        }
        return null;
      }
    },
    [apiFunction],
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
