import { noteEntrySchema } from '@/schema/note-and-coowner.schema';
import { z } from 'zod';

export type Note = z.infer<typeof noteEntrySchema>;
