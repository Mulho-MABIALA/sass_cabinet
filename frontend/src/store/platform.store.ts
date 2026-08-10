import { create } from "zustand";
import { persist } from "zustand/middleware";

// Session de la console plateforme (super-admin) : volontairement séparée de useAuthStore
// (session cabinet). Pas de refresh token ici — l'admin plateforme se reconnecte simplement
// quand son token expire (durée de vie courte, PLATFORM_JWT_EXPIRES_IN côté backend), ce qui
// suffit pour un outil interne utilisé occasionnellement.
interface PlatformAuthState {
  accessToken: string | null;
  email: string | null;
  setSession: (accessToken: string, email: string) => void;
  clearSession: () => void;
}

export const usePlatformAuthStore = create<PlatformAuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      email: null,
      setSession: (accessToken, email) => set({ accessToken, email }),
      clearSession: () => set({ accessToken: null, email: null }),
    }),
    { name: "sassfr-platform-auth" }
  )
);
