import mongoose from 'mongoose';
import { IGNORED_QUERY_KEYS } from './constants.js';

const isObjectIdField = (path) => path?.instance === 'ObjectID' || path?.instance === 'ObjectId';

export const buildQueryFilter = (query = {}, model) => {
  const filter = { isDeleted: false };

  if (query.search && typeof query.search === 'string' && query.search.trim()) {
    const search = query.search.trim();
    const stringPaths = [];
    if (model?.schema?.paths) {
      for (const [key, path] of Object.entries(model.schema.paths)) {
        if (path.instance === 'String' && !['password', 'resetToken', 'resetTokenExpiry'].includes(key)) {
          stringPaths.push(key);
        }
      }
    }
    if (stringPaths.length) {
      filter.$or = stringPaths.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
    }
  }

  for (const [key, value] of Object.entries(query)) {
    if (IGNORED_QUERY_KEYS.includes(key) || key === 'search') continue;
    if (value === undefined || value === null || value === '') continue;

    const path = model?.schema?.paths?.[key];
    if (!path) continue;

    if (isObjectIdField(path)) {
      if (mongoose.Types.ObjectId.isValid(value)) {
        filter[key] = new mongoose.Types.ObjectId(value);
      }
      continue;
    }

    switch (path.instance) {
      case 'String':
        filter[key] = { $regex: String(value), $options: 'i' };
        break;
      case 'Number':
        filter[key] = Number(value);
        break;
      case 'Boolean':
        filter[key] = value === 'true' || value === true;
        break;
      case 'Date':
        filter[key] = new Date(value);
        break;
      default:
        if (path.enumValues?.length) {
          if (path.enumValues.includes(value)) filter[key] = value;
        } else {
          filter[key] = value;
        }
    }
  }

  return filter;
};
