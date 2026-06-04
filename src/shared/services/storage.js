import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { isS3Configured, buildObjectKey, uploadBuffer, deleteObject } from './s3.js';
import { UPLOAD_ROOT, isS3ObjectKey } from '../utils/uploadPaths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsRoot = path.join(__dirname, `../../../${UPLOAD_ROOT}`);

export const useMemoryUploads = () => isS3Configured() || process.env.VERCEL === '1';

export const persistUploadedFile = async (file, subdir) => {
  if (!file) {
    const err = new Error('File is required');
    err.status = 400;
    throw err;
  }

  if (isS3Configured()) {
    const key = buildObjectKey(subdir, file.originalname);
    const body = file.buffer ?? (file.path ? fs.readFileSync(file.path) : null);
    if (!body) {
      const err = new Error('File buffer is missing');
      err.status = 400;
      throw err;
    }
    await uploadBuffer(key, body, file.mimetype);
    if (file.path) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* ignore local cleanup */
      }
    }
    return key;
  }

  if (file.path) {
    return `${subdir}/${path.basename(file.path)}`;
  }
  return `${subdir}/${file.filename}`;
};

export const removeStoredFile = async (storedPath) => {
  if (!storedPath || storedPath.startsWith('http')) return;
  if (isS3Configured() && isS3ObjectKey(storedPath)) {
    await deleteObject(storedPath);
    return;
  }
  const localPath = path.join(uploadsRoot, storedPath.replace(/^\//, ''));
  if (fs.existsSync(localPath)) {
    fs.unlinkSync(localPath);
  }
};
