import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '../api/client.js';

/**
 * Loads JSON from `/api/...` once per mount/path change and supports manual retry or optimistic updates.
 */
export function useFetch(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(Boolean(path));
  const [reloadCount, setReloadCount] = useState(0);

  const reload = useCallback(() => {
    setReloadCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      setData(null);
      setError(null);
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    apiFetch(path, { signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === 'AbortError') return;
        setError(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [path, reloadCount]);

  return { data, error, loading, reload, setData };
}
