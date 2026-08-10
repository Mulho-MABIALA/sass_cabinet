import { z } from "zod";

export const dossierIdParamSchema = z.object({
  id: z.string().uuid(),
});
