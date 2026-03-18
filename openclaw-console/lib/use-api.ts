"use client";
// lib/use-api.ts — lightweight SWR-like hook (no extra dependencies)
import { useState, useEffect, useCallback, useRef } from "react";

interface State<T> {
  data:    T | null;
  loading: boolean;
  error:   string | null;
}

export function useApi<T>(
  fetcher: (() => Promise<T>) | null,
  deps: unknown[] = []
): State<T> & { refetch: () => void } {
  const [state, setState] = useState<State<T>>({ data: null, loading: !!fetcher, error: null });
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    if (!fetcher) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher();
      if (mountedRef.current) setState({ data, loading: false, error: null });
    } catch (e) {
      if (mountedRef.current) setState({ data: null, loading: false, error: (e as Error).message });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    run();
    return () => { mountedRef.current = false; };
  }, [run]);

  return { ...state, refetch: run };
}
