import {
  createDealSchema,
  dealBaseSchema,
  dealFilterSchema,
  dealResponseSchema,
  dealsResponseSchema,
  updateDealSchema,
} from '@/schema/deal.schema';
import { z } from 'zod';

import { DealStatus, PropertyType } from './enums';

export type DealBase = z.infer<typeof dealBaseSchema>;
export type CreateDeal = z.infer<typeof createDealSchema>;
export type UpdateDeal = z.infer<typeof updateDealSchema>;
export type DealFilter = z.infer<typeof dealFilterSchema>;
export type Deal = z.infer<typeof dealResponseSchema>;
export type DealsResponse = z.infer<typeof dealsResponseSchema>;
