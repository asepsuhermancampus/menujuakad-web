"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { authRequest, AuthClientError } from "@/features/auth/lib/auth-client";
export function useAccountResource<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++generation.current;
    try {
      const result = await authRequest<T>(path);
      if (!result.data) throw new AuthClientError(503);
      if (mounted.current && request === generation.current) {
        setData(result.data);
        setError("");
      }
    } catch (e) {
      if (mounted.current && request === generation.current) {
        setData(null);
        setError(e instanceof Error ? e.message : "Tidak dapat memuat akun.");
      }
    } finally {
      if (mounted.current && request === generation.current) setLoading(false);
    }
  }, [path]);
  useEffect(() => {
    mounted.current = true;
    // Bootstrap asinkron; callback tidak berjalan bila komponen sudah dilepas.
    void Promise.resolve().then(() => {
      if (mounted.current) return refresh();
    });
    return () => {
      mounted.current = false;
    };
  }, [refresh]);
  return { data, error, loading, refresh };
}
