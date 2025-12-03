// lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
}


let isRefreshing = false;

function buildURL(path: string) {
  const base = API_URL?.replace(/\/$/, "") || "";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}


async function refreshSession(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem("refreshToken") || localStorage.getItem("refresh_token");
    if (!refreshToken) return false;


    const res = await fetch(`${API_URL}/auth/refresh`, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (res.ok) {
      const data = await res.json();
   
      if (data.access_token) localStorage.setItem("access_token", data.access_token); 
      if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);     
      return true;
    }
    return false;
  } catch (error) {
    console.error("Erro ao fazer refresh:", error);
    return false;
  }
}

async function request(path: string, options: RequestInit = {}): Promise<ApiResponse> {
 
  const token = 
    typeof window !== "undefined" 
      ? (localStorage.getItem("accessToken") || localStorage.getItem("access_token")) 
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.headers) Object.assign(headers, options.headers as Record<string, string>);

  if (!API_URL) return { ok: false, status: 500, data: { message: "API URL missing" } };

  const url = buildURL(path);
  console.log(`[API] ${options.method || "GET"} → ${url}`);

  try {
    const res = await fetch(url, { ...options, headers });
    
 
    if ((res.status === 401 || res.status === 500) && !isRefreshing) {
        console.warn(`⚠️ Erro ${res.status} detectado. Tentando refresh...`);
        
        isRefreshing = true;
        const refreshSucesso = await refreshSession();
        isRefreshing = false;

        if (refreshSucesso) {
            console.log("🔄 Refresh OK! Tentando requisição novamente...");
            
           
            const newToken = localStorage.getItem("accessToken") || localStorage.getItem("access_token");
            const newHeaders = { ...headers, "Authorization": `Bearer ${newToken}` };
            
            const retryRes = await fetch(url, { ...options, headers: newHeaders });
            
         
            const text = await retryRes.text();
            let data;
            try { data = JSON.parse(text); } catch { data = { message: text }; }
            return { ok: retryRes.ok, status: retryRes.status, data };
        } else {
            console.error("❌ Falha no refresh. Usuário precisa logar de novo.");
           
        }
    }


    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }

    return { ok: res.ok, status: res.status, data };

  } catch (error) {
    console.error("⚠️ Erro de conexão:", error);
    return { ok: false, status: 0, data: { message: "Falha ao conectar com a API." } };
  }
}


export function apiGet(path: string) { return request(path, { method: "GET" }); }
export function apiPost(path: string, body: any) { return request(path, { method: "POST", body: JSON.stringify(body) }); }
export function apiPut(path: string, body: any) { return request(path, { method: "PUT", body: JSON.stringify(body) }); }
export function apiDelete(path: string) { return request(path, { method: "DELETE" }); }
export async function apiDownload(path: string, body: any) {  return { ok: false, status: 0, data: null }; }