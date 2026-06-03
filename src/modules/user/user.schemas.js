import { z } from 'zod';
import { USER_ROLES, USER_STATUSES } from '../../shared/utils/constants.js';
import { objectIdSchema, paginationQuerySchema } from '../../shared/validators/common.schemas.js';

const optionalEnum = (values) =>
  z.preprocess((v) => (v === '' || v == null ? undefined : v), z.enum(values).optional());

export const listUsersQuerySchema = paginationQuerySchema.extend({
  role: optionalEnum(USER_ROLES),
  status: optionalEnum(USER_STATUSES),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(USER_ROLES),
  status: z.enum(USER_STATUSES),
});

export const updateUserSchema = createUserSchema;

export const userIdParamSchema = z.object({
  id: objectIdSchema,
});
