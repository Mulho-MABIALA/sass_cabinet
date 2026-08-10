import { z } from "zod";

export const documentIdParamSchema = z.object({
  id: z.string().uuid(),
});
