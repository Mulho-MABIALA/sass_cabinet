import { apiRequest } from "./client";
import { AuthTokens, Role } from "../types";

interface InvitationEnvoyee {
  id: string;
  email: string;
  role: Role;
  expiresAt: string;
}

interface InvitationVue {
  email: string;
  role: Role;
  cabinetNom: string;
}

export const invitationsApi = {
  inviter(email: string, role: Role): Promise<InvitationEnvoyee> {
    return apiRequest<InvitationEnvoyee>("/invitations", {
      method: "POST",
      body: { email, role },
    });
  },

  getInvitation(token: string): Promise<InvitationVue> {
    return apiRequest<InvitationVue>(`/invitations/${token}`, { auth: false });
  },

  accepter(token: string, motDePasse: string): Promise<AuthTokens> {
    return apiRequest<AuthTokens>(`/invitations/${token}/accepter`, {
      method: "POST",
      body: { motDePasse },
      auth: false,
    });
  },
};
