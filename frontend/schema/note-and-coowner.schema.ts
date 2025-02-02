import { z } from 'zod';

export const noteEntrySchema = z.object({
  time: z.string(),
  note: z.string(),
});

export const coownerSchema = z.object({
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
});