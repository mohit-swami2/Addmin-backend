import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import * as controller from './globalSetting.controller.js';
import { saveSettingsSchema } from './globalSetting.schemas.js';

const router = Router();

router.get('/', controller.getPublic);
router.put('/', requireAuth, validate(saveSettingsSchema), controller.save);

export default router;
