import { connectDatabase } from './db.js';

let initialized = false;

export const ensureAppInitialized = async () => {
  if (initialized) return;
  await connectDatabase();
  initialized = true;
};
