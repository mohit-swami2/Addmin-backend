/** Local folder name and S3 key prefix for all uploaded files */
export const UPLOAD_ROOT = 'uploads3';

/** HTTP path segment served by Express static (local dev without S3) */
export const UPLOAD_URL_PATH = `/${UPLOAD_ROOT}`;

export const isS3ObjectKey = (storedPath) =>
  storedPath?.startsWith(`${UPLOAD_ROOT}/`) || storedPath?.startsWith('uploads/');
