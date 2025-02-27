import { z } from 'zod';

export const noteEntrySchema = z.object({
  time: z.string(),
  note: z.string(),
  author: z.enum(['Me', 'Admin', 'Team Leader', 'Client']).nullish(),
});

export const coownerSchema = z.object({
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  phone: z.string().nullish(),
});