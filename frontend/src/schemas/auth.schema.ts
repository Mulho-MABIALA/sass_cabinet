import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(1, "Mot de passe requis"),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
