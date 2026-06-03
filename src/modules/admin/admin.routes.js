import { Router } from 'express';
import { validate } from '../../shared/middleware/validate.js';
import { requireAuth } from '../../shared/middleware/auth.js';
import { authLimiter } from '../../shared/middleware/rateLimiter.js';
import { profileUpload } from '../../shared/middleware/upload.js';
import * as controller from './admin.controller.js';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
} from './admin.schemas.js';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), controller.login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), controller.forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), controller.resetPassword);

router.get('/profile', requireAuth, controller.getProfile);
router.put('/profile', requireAuth, validate(updateProfileSchema), controller.updateProfile);
router.post('/profile/avatar', requireAuth, (req, res, next) => {
  profileUpload(req, res, (err) => {
    if (err) return next({ status: 400, message: err.message });
    next();
  });
}, controller.uploadAvatar);
router.put('/change-password', requireAuth, validate(changePasswordSchema), controller.changePassword);

export default router;
