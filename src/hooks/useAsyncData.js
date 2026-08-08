import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useAsyncData(fetcher, deps)
 *
 * Thin wrapper around useState/useEffect that gives every data-fetching
 * component a consistent { data, isLoading, error, refetch } shape —
 * whether `fetcher` currently resolves mock data or, later, hits FastAPI
 * through fetch/axios. Centralizing this now means the loading/error UI
 * built against it today keeps working unchanged after the backend swap.
 *
 * @param {() => Promise<any>} fetcher
 * @param {Array<any>} deps - re-runs the fetch when these change
 */
export function useAsyncData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const thisRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (requestId.current === thisRequest) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (requestId.current === thisRequest) {
          setError(err);
          setIsLoading(false);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refetch: load };
}
