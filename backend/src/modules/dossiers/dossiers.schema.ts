import { z } from "zod";

export const createDossierSchema = z.object({
  typeDossierId: z.string().uuid(),
  nomClient: z.string().min(1),
  emailClient: z.string().email(),
  telephoneClient: z.string().min(1).optional(),
  collaborateurId: z.string().uuid().optional(),
});

export type CreateDossierInput = z.infer<typeof createDossierSchema>;

export const dossierIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const listDossiersQuerySchema = z.object({
  statut: z.enum(["incomplet", "en_attente_verification", "complet"]).optional(),
});

export type ListDossiersQuery = z.infer<typeof listDossiersQuerySchema>;

export const exportQuerySchema = z.object({
  format: z.enum(["json", "csv"]).default("json"),
});

export type ExportQuery = z.infer<typeof exportQuerySchema>;

export const exportMetierQuerySchema = z.object({
  systeme: z.enum(["septeo", "cegid"]),
});

export type ExportMetierQuery = z.infer<typeof exportMetierQuerySchema>;
