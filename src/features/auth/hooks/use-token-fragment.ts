"use client";
import { useEffect, useState } from "react";
export function takeTokenFragment(
  location: Pick<Location, "hash" | "pathname" | "search">,
  history: Pick<History, "replaceState" | "state">,
): string {
  const params = new URLSearchParams(location.hash.slice(1));
  const token = params.get("token") ?? "";
  const query = new URLSearchParams(location.search);
  query.delete("token");
  const cleanQuery = query.toString();
  history.replaceState(history.state, "", location.pathname + (cleanQuery ? `?${cleanQuery}` : ""));
  return /^[A-Za-z0-9_-]{20,512}$/.test(token) ? token : "";
}
export function useTokenFragment() {
  const [token, setToken] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    // Tautan tidak dikonsumsi saat render; scanner dan StrictMode tidak memicu POST.
    const found = takeTokenFragment(window.location, window.history);
    void Promise.resolve(found).then((value) => {
      if (value) setToken(value);
      setLoaded(true);
    });
  }, []);
  return { token, loaded };
}
