import { z } from 'zod';

export const noteEntrySchema = z.object({
  time: z.string(),
  note: z.string(),
});