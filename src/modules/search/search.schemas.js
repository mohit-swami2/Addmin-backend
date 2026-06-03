import { z } from 'zod';

export const globalSearchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query is required').max(100),
  limit: z.coerce.number().int().min(1).max(15).optional(),
});
