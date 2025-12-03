import { apiDelete, apiGet, apiPost, apiPut, apiDownload } from "@/lib/api";
import { useState } from "react";

export function useApi() {
  const [loading, setLoading] = useState(false);

  const wrap = async (fn: () => Promise<any>) => {
    setLoading(true);
    const res = await fn();
    setLoading(false);
    return res;
  };

  return {
    loading,
    get: (p: string) => wrap(() => apiGet(p)),
    post: (p: string, b: any) => wrap(() => apiPost(p, b)),
    put: (p: string, b: any) => wrap(() => apiPut(p, b)),
    remove: (p: string) => wrap(() => apiDelete(p)),
    download: (p: string, b: any) => wrap(() => apiDownload(p, b)),
  };
}
