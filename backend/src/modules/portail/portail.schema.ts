import { z } from "zod";

export const tokenParamSchema = z.object({
  token: z.string().uuid(),
});

export const uploadBodySchema = z.object({
  documentRequisId: z.string().uuid(),
});

export type UploadBodyInput = z.infer<typeof uploadBodySchema>;
