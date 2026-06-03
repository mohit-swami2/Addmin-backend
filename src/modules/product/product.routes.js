import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { getRequestLimiter } from '../../shared/middleware/rateLimiter.js';
import { productUpload } from '../../shared/middleware/upload.js';
import * as controller from './product.controller.js';
import {
  listProductsQuerySchema,
  productBodySchema,
  productIdParamSchema,
} from './product.schemas.js';

const router = Router();

router.use(requireAuth, getRequestLimiter);

router.get('/', validate(listProductsQuerySchema, 'query'), controller.list);
router.post('/', validate(productBodySchema), controller.create);
router.put('/:id', validate(productIdParamSchema, 'params'), validate(productBodySchema), controller.update);
router.post('/:id/image', validate(productIdParamSchema, 'params'), (req, res, next) => {
  productUpload(req, res, (err) => {
    if (err) return next({ status: 400, message: err.message });
    next();
  });
}, controller.uploadImage);
router.delete('/:id', validate(productIdParamSchema, 'params'), controller.remove);

export default router;
