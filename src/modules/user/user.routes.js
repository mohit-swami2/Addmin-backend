import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { getRequestLimiter } from '../../shared/middleware/rateLimiter.js';
import * as controller from './user.controller.js';
import {
  listUsersQuerySchema,
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
} from './user.schemas.js';

const router = Router();

router.use(requireAuth, getRequestLimiter);

router.get('/', validate(listUsersQuerySchema, 'query'), controller.list);
router.post('/', validate(createUserSchema), controller.create);
router.put('/:id', validate(userIdParamSchema, 'params'), validate(updateUserSchema), controller.update);
router.delete('/:id', validate(userIdParamSchema, 'params'), controller.remove);

export default router;
