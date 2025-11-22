// src/app/auth/google/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function parseJwt(token: string) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const idToken = searchParams.get("id_token");

    if (!accessToken) {
      router.replace("/Login");
      return;
    }


    localStorage.setItem("access_token", accessToken);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    if (idToken) localStorage.setItem("id_token", idToken);

    if (idToken) {
      const payload = parseJwt(idToken);

      localStorage.setItem("name", payload.name);
      localStorage.setItem("email", payload.email);
      localStorage.setItem("google_id", payload.sub);

      const user = {
        name:
          payload.name ||
          `${payload.given_name ?? ""} ${payload.family_name ?? ""}`.trim() ||
          "Usuário",
        email: payload.email,
        image: payload.picture,
      };

      localStorage.setItem("user", JSON.stringify(user));
    }

    router.replace("/Dashboard");
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen text-lg">
      Processando login com o Google...
    </div>
  );
}