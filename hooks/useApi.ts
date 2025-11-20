import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { useState } from "react";


export function useApi() {
  const [loading, setLoading] = useState(false);

  async function get(path: string) {
    setLoading(true);
    const res = await apiGet(path);
    setLoading(false);
    return res;
  }

  async function post(path: string, body: any) {
    setLoading(true);
    const res = await apiPost(path, body);
    setLoading(false);
    return res;
  }

  async function put(path: string, body: any) {
    setLoading(true);
    const res = await apiPut(path, body);
    setLoading(false);
    return res;
  }

  async function remove(path: string) {
    setLoading(true);
    const res = await apiDelete(path);
    setLoading(false);
    return res;
  }

  return {
    loading,
    get,
    post,
    put,
    remove,
  };
}
