"use client";
import { useState, type FormEvent } from "react";
import { identifierError, cleanIdentifierInput } from "../lib/identifier-input";
import { authRequest, AuthClientError, redirectAfterAuth } from "../lib/auth-client";
import { readLoginResult } from "../lib/login-result";
import type { LoginData, OtpChallenge } from "../types/auth-contracts";
import { useAuthRequest } from "./use-auth-request";
export function useLogin(next?: string) {
  const state = useAuthRequest();
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const error = identifierError(data.get("identifier"));
    if (error) {
      state.setMessage(error);
      return;
    }
    void state.run(async () => {
      const response = await authRequest<LoginData>("/api/auth/login", "POST", {
        identifier: cleanIdentifierInput(String(data.get("identifier") ?? "")),
        password: data.get("password"),
        ...(next ? { next } : {}),
      });
      const result = readLoginResult(response);
      if (result.kind === "otp") setChallenge(result.challenge);
      else redirectAfterAuth(result.redirectTo);
    });
  }
  async function verify(code: string) {
    if (!challenge) throw new AuthClientError(400);
    const result = await authRequest("/api/auth/otp/verify", "POST", {
      token: challenge.token,
      code,
    });
    redirectAfterAuth(result.redirectTo);
  }
  async function resend() {
    if (!challenge) throw new AuthClientError(400);
    const result = await authRequest<OtpChallenge>("/api/auth/otp/resend", "POST", {
      token: challenge.token,
    });
    if (!result.data?.token) throw new AuthClientError(503);
    setChallenge(result.data);
  }
  return { ...state, submit, challenge, verify, resend, cancelChallenge: () => setChallenge(null) };
}
