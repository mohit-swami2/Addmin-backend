import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { useMemoryUploads } from '../services/storage.js';
import { UPLOAD_ROOT } from '../utils/uploadPaths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, `../../../${UPLOAD_ROOT}`);

const ensureDir = (subdir) => {
  const dir = path.join(uploadsRoot, subdir);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const diskStorage = (subdir) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureDir(subdir)),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.jpg';
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });

const maxMb = (key, fallback = 5) =>
  (Number(process.env[key]) || fallback) * 1024 * 1024;

const createUpload = (subdir, fieldName) => {
  const storage = useMemoryUploads() ? multer.memoryStorage() : diskStorage(subdir);
  return multer({
    storage,
    limits: { fileSize: maxMb(fieldName === 'avatar' ? 'PROFILE_IMAGE_MAX_SIZE_MB' : 'PRODUCT_IMAGE_MAX_SIZE_MB') },
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Only image files are allowed'));
      }
      cb(null, true);
    },
  }).single(fieldName);
};

export const profileUpload = createUpload('profile', 'avatar');
export const productUpload = createUpload('products', 'image');
