import jwt from 'jsonwebtoken';
import { loadJwtKeys } from '../utils/keyManager.js';
import { sendError } from '../utils/response.js';
import Admin from '../../modules/admin/admin.model.js';

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return sendError(res, { status: 401, message: 'Authentication required' });
    }
    const token = header.slice(7);
    const { publicKey } = loadJwtKeys();
    const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
    const admin = await Admin.findOne({ _id: payload.adminId, isDeleted: false }).select('-password');
    if (!admin) {
      return sendError(res, { status: 401, message: 'Invalid or expired token' });
    }
    req.admin = admin;
    req.adminId = admin._id;
    next();
  } catch {
    return sendError(res, { status: 401, message: 'Invalid or expired token' });
  }
};
