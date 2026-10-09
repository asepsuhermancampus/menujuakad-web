"use client";

import { useRouter } from "next/navigation";
import { authRequest } from "@/features/auth/lib/auth-client";
import { useAuthRequest } from "@/features/auth/hooks/use-auth-request";
import { Button } from "@/components/ui/button";
export function LogoutButton() {
  const router = useRouter();
  const state = useAuthRequest();
  function logout() {
    void state.run(async () => {
      await authRequest("/api/auth/logout", "POST", {});
      router.replace("/login");
      router.refresh();
    });
  }
  return (
    <div>
      <Button className="secondary" disabled={!state.ready || state.pending} onClick={logout}>
        {state.pending ? "Keluar…" : "Keluar"}
      </Button>
      {state.message && <p role="alert">{state.message}</p>}
    </div>
  );
}
