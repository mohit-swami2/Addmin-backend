import { z } from 'zod';
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from '../../shared/utils/constants.js';
import { objectIdSchema, paginationQuerySchema } from '../../shared/validators/common.schemas.js';

const optionalEnum = (values) =>
  z.preprocess((v) => (v === '' || v == null ? undefined : v), z.enum(values).optional());

const optionalNumber = z.preprocess(
  (v) => (v === '' || v == null ? undefined : v),
  z.coerce.number().optional()
);

export const listProductsQuerySchema = paginationQuerySchema.extend({
  category: optionalEnum(PRODUCT_CATEGORIES),
  status: optionalEnum(PRODUCT_STATUSES),
  minPrice: optionalNumber,
  maxPrice: optionalNumber,
});

export const productBodySchema = z.object({
  name: z.string().min(2).max(200),
  sku: z.string().min(2).max(50),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  status: z.enum(PRODUCT_STATUSES),
  description: z.string().max(2000).optional(),
  image: z.string().nullable().optional(),
});

export const productIdParamSchema = z.object({
  id: objectIdSchema,
});
