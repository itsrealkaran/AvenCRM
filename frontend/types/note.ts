import { noteEntrySchema } from '@/schema/note.schema';
import { z } from 'zod';

export type Note = z.infer<typeof noteEntrySchema>;
