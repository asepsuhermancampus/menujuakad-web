"use client";
import { useEffect, useState } from "react";
import { authRequest } from "../lib/auth-client";
import { unavailableCapabilities, type AuthCapabilities } from "../types/auth-contracts";
export function useCapabilities() {
  const [capabilities, setCapabilities] = useState<AuthCapabilities>(unavailableCapabilities);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let active = true;
    void authRequest<AuthCapabilities>("/api/auth/capabilities")
      .then(({ data }) => {
        if (active && data)
          setCapabilities({
            google: data.google === true,
            emailRecovery: data.emailRecovery === true,
            smsOtp: data.smsOtp === true,
          });
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);
  return { capabilities, loaded };
}
