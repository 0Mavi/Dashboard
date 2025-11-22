"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const publicRoutes = ["/Login", "/", "/auth/google/callback"]; 

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    const isPublic = publicRoutes.includes(pathname);

    if (!token && !isPublic) {
      router.push("/Login");
      return;
    }

    if (token && pathname === "/Login") {
      router.push("/Dashboard");
      return;
    }

    setLoading(false);
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Carregando...
      </div>
    );
  }

  return <>{children}</>;
}
