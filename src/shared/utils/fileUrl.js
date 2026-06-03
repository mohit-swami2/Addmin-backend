export const toPublicFileUrl = (req, relativePath) => {
  if (!relativePath) return null;
  if (relativePath.startsWith('http')) return relativePath;
  const base = process.env.OAUTH_CALLBACK_BASE_URL || `${req.protocol}://${req.get('host')}`;
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\//, '');
  return `${base}/uploads/${normalized}`;
};
