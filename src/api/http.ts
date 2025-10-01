export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ""; // e.g. "http://localhost:8080"


async function http<T>(
input: RequestInfo,
init?: RequestInit
): Promise<T> {
const res = await fetch(String(input), {
headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
credentials: 'include',
...init,
});
if (!res.ok) {
const text = await res.text();
throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
}
return (await res.json()) as T;
}


export const httpGet = <T,>(path: string) => http<T>(`${API_BASE}${path}`);
export const httpPost = <T,>(path: string, body: unknown) =>
http<T>(`${API_BASE}${path}`, { method: 'POST', body: JSON.stringify(body) });
export const httpPut = <T,>(path: string, body: unknown) =>
http<T>(`${API_BASE}${path}`, { method: 'PUT', body: JSON.stringify(body) });
export const httpPatch = <T,>(path: string, body?: unknown) =>
http<T>(`${API_BASE}${path}`, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });