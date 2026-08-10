import { apiRequest } from "./client";
import { AuthTokens } from "../types";

export const authApi = {
  login(email: string, motDePasse: string): Promise<AuthTokens> {
    return apiRequest<AuthTokens>("/auth/login", {
      method: "POST",
      body: { email, motDePasse },
      auth: false,
    });
  },
};
