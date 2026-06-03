import { sendError } from '../utils/response.js';

const cleanupUploadedFiles = (req) => {
  if (req.file?.path) {
    import('fs').then((fs) => fs.promises.unlink(req.file.path).catch(() => {}));
  }
  if (req.files?.length) {
    import('fs').then((fs) =>
      Promise.all(req.files.map((f) => fs.promises.unlink(f.path).catch(() => {})))
    );
  }
};

export const validate =
  (schema, source = 'body') =>
  async (req, res, next) => {
    try {
      const data = req[source];
      const parsed = await schema.parseAsync(data);
      if (source === 'query') {
        req.parsedQuery = parsed;
      } else if (source === 'params') {
        req.parsedParams = parsed;
      } else {
        req[source] = parsed;
      }
      next();
    } catch (err) {
      cleanupUploadedFiles(req);
      const details = err.errors?.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return sendError(res, {
        status: 400,
        message: 'Validation failed',
        details,
      });
    }
  };
