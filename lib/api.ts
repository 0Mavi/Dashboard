const API_URL = process.env.NEXT_PUBLIC_API_URL;


interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
}

async function request(path: string, options: RequestInit = {}): Promise<ApiResponse> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;


  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };


  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      for (const [key, value] of options.headers) {
        headers[key] = value;
      }
    } else {
      Object.assign(headers, options.headers as Record<string, string>);
    }
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  

  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL não está definido nas variáveis de ambiente.");
    return { ok: false, status: 500, data: { message: "API URL não configurada" } };
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers, 
  });

  const data = await res.json().catch(() => null);

  return {
    ok: res.ok,
    status: res.status,
    data,
  };
}

export function apiGet(path: string): Promise<ApiResponse> {
  return request(path, { method: "GET" });
}

export function apiPost(path: string, body: any): Promise<ApiResponse> {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPut(path: string, body: any): Promise<ApiResponse> {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function apiDelete(path: string): Promise<ApiResponse> {
  return request(path, { method: "DELETE" });
}