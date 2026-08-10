import { z } from "zod";

export const inviterSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "collaborateur"]),
});

export type InviterInput = z.infer<typeof inviterSchema>;

export const tokenParamSchema = z.object({
  token: z.string().uuid(),
});

export const accepterInvitationSchema = z.object({
  motDePasse: z.string().min(8, "8 caractères minimum"),
});

export type AccepterInvitationInput = z.infer<typeof accepterInvitationSchema>;
