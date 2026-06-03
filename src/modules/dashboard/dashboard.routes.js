import { Router } from 'express';
import { requireAuth } from '../../shared/middleware/auth.js';
import * as controller from './dashboard.controller.js';

const router = Router();
router.get('/overview', requireAuth, controller.overview);
export default router;
