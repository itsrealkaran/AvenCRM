import { ReactNode } from 'react';
import { z } from 'zod';

export const noteEntrySchema = z.object({
  time: z.string(),
  note: z.string(),
});

export type NoteEntry = z.infer<typeof noteEntrySchema>;

export interface BaseEntityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  title: string;
  onSubmit: (values: any) => void;
  defaultValues: any;
  schema: z.ZodSchema;
  children: ReactNode | ((form: any) => ReactNode); // Updated this line
}
