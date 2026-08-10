import { z } from "zod";

export const platformLoginSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(1),
});

export type PlatformLoginInput = z.infer<typeof platformLoginSchema>;

export const cabinetIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const updateCabinetSchema = z.object({
  plan: z.enum(["starter", "cabinet", "premium"]).optional(),
  actif: z.boolean().optional(),
});

export type UpdateCabinetInput = z.infer<typeof updateCabinetSchema>;
