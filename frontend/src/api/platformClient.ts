import { usePlatformAuthStore } from "../store/platform.store";
import { ApiError } from "./client";

const API_URL = import.meta.env.VITE_API_URL as string;

type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; message: string; details?: unknown };

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
}

// Client HTTP dédié à la console plateforme : univers d'authentification totalement séparé de
// apiRequest (session cabinet) — jamais le même token, jamais la même logique de refresh.
export async function platformApiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (options.auth ?? true) {
    const { accessToken } = usePlatformAuthStore.getState();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const envelope = (await response.json()) as ApiEnvelope<T>;

  if (!envelope.success) {
    if (response.status === 401) {
      usePlatformAuthStore.getState().clearSession();
    }
    throw new ApiError(envelope.message, response.status, envelope.details);
  }

  return envelope.data;
}
