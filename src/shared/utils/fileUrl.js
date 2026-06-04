import { isS3Configured, getPresignedReadUrl } from '../services/s3.js';
import { UPLOAD_URL_PATH, isS3ObjectKey } from './uploadPaths.js';

export const toPublicFileUrl = (req, relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  const base = process.env.OAUTH_CALLBACK_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\//, '');
  return `${base}${UPLOAD_URL_PATH}/${normalized}`;
};

export const resolveStoredFileUrl = async (storedPath, req) => {
  if (!storedPath) return null;
  if (storedPath.startsWith('http')) return storedPath;
  if (isS3Configured() && isS3ObjectKey(storedPath)) {
    return getPresignedReadUrl(storedPath);
  }
  if (req) return toPublicFileUrl(req, storedPath);
  return storedPath;
};

export const serializeAdminUser = async (admin, req) => {
  const user = admin.toAuthJSON();
  user.avatar = await resolveStoredFileUrl(user.avatar, req);
  return user;
};

export const serializeProduct = async (product, req) => {
  const item = product.toListJSON();
  item.image = await resolveStoredFileUrl(item.image, req);
  return item;
};
