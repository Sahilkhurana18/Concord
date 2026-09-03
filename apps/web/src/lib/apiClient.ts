const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function getApiToken(): Promise<string> {
  const res = await fetch("/api/token");
  if (!res.ok) throw new Error("Not authenticated");
  const { token } = (await res.json()) as { token: string };
  return token;
}

/**
 * Calls the Express sync/API server with a short-lived Authorization
 * token instead of relying on cookies, which browsers increasingly block
 * on cross-site requests regardless of SameSite configuration.
 */
export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getApiToken();
  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
}
