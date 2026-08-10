import { useAuthStore } from "../store/auth.store";
import { AuthTokens } from "../types";

const API_URL = import.meta.env.VITE_API_URL as string;

type ApiEnvelope<T> =
  | { success: true; data: T }
  | { success: false; message: string; details?: unknown };

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean;
  isFormData?: boolean;
}

async function rawRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {};

  if (!options.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (options.auth) {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.isFormData
      ? (options.body as FormData)
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  const envelope = (await response.json()) as ApiEnvelope<T>;

  if (!envelope.success) {
    throw new ApiError(envelope.message, response.status, envelope.details);
  }

  return envelope.data;
}

async function refreshSession(): Promise<boolean> {
  const { refreshToken, setSession, clearSession } = useAuthStore.getState();
  if (!refreshToken) return false;

  try {
    const tokens = await rawRequest<AuthTokens>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
    setSession(tokens);
    return true;
  } catch {
    clearSession();
    return false;
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const wantsAuth = options.auth ?? true;

  try {
    return await rawRequest<T>(path, { ...options, auth: wantsAuth });
  } catch (error) {
    const isAuthError = error instanceof ApiError && error.status === 401;

    if (wantsAuth && isAuthError) {
      const refreshed = await refreshSession();
      if (refreshed) {
        return rawRequest<T>(path, { ...options, auth: true });
      }
    }

    throw error;
  }
}

// Télécharge un fichier depuis un endpoint authentifié (ex. export CSV/FEC) : contrairement à une balise
// <a href> classique, ceci envoie bien l'en-tête Authorization (obligatoire, toutes les routes /dossiers
// exigent requireAuth), puis déclenche le téléchargement du navigateur via un Blob.
export async function downloadFile(path: string, nomFichierParDefaut: string): Promise<void> {
  const { accessToken } = useAuthStore.getState();

  const response = await fetch(`${API_URL}${path}`, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!response.ok) {
    throw new ApiError("Échec du téléchargement du fichier", response.status);
  }

  const blob = await response.blob();
  const dispositionEntete = response.headers.get("Content-Disposition");
  const nomFichier = dispositionEntete?.match(/filename=([^;]+)/)?.[1] ?? nomFichierParDefaut;

  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
}
