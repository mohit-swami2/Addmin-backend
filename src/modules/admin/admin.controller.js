import { sendSuccess } from '../../shared/utils/response.js';
import * as adminService from './admin.service.js';

export const register = async (req, res, next) => {
  try {
    const admin = await adminService.registerAdmin(req.body);
    return sendSuccess(res, {
      status: 201,
      message: 'Registration successful. Please login.',
      data: [adminService.formatAuthResponse(admin, req).user],
    });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const admin = await adminService.loginAdmin(req.body);
    const auth = adminService.formatAuthResponse(admin, req);
    return sendSuccess(res, { message: 'Login successful', data: [auth] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await adminService.requestPasswordReset(req.body.email);
    return sendSuccess(res, {
      message: `If an account exists, a reset link was sent to ${req.body.email}`,
      data: [],
    });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await adminService.resetPassword(req.body);
    return sendSuccess(res, { message: 'Password reset successfully', data: [] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const admin = await adminService.getProfile(req.adminId);
    return sendSuccess(res, {
      message: 'Profile fetched',
      data: [admin.toAuthJSON(req)],
    });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const admin = await adminService.updateProfile(req.adminId, req.body);
    return sendSuccess(res, {
      message: 'Profile updated',
      data: [admin.toAuthJSON(req)],
    });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next({ status: 400, message: 'Avatar file is required' });
    }
    const relativePath = `profile/${req.file.filename}`;
    const admin = await adminService.updateAvatar(req.adminId, relativePath);
    const avatarUrl = admin.toAuthJSON(req).avatar;
    return sendSuccess(res, { message: 'Avatar uploaded', data: [{ avatar: avatarUrl }] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const changePassword = async (req, res, next) => {
  try {
    await adminService.changePassword(req.adminId, req.body);
    return sendSuccess(res, { message: 'Password changed successfully', data: [] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const oauthCallback = async (req, res, next) => {
  try {
    if (!req.user) {
      return next({ status: 401, message: 'OAuth authentication failed' });
    }
    const auth = adminService.formatAuthResponse(req.user, req);
    const redirectUrl = new URL('/auth/callback', process.env.FRONTEND_URL);
    const payload = Buffer.from(JSON.stringify(auth)).toString('base64url');
    redirectUrl.searchParams.set('payload', payload);
    return res.redirect(redirectUrl.toString());
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};
