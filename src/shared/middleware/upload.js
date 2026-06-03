import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, '../../../uploads');

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

export const profileUpload = multer({
  storage: diskStorage('profile'),
  limits: { fileSize: maxMb('PROFILE_IMAGE_MAX_SIZE_MB') },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
}).single('avatar');

export const productUpload = multer({
  storage: diskStorage('products'),
  limits: { fileSize: maxMb('PRODUCT_IMAGE_MAX_SIZE_MB') },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
}).single('image');
