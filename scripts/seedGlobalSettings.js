import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { default: GlobalSetting } = await import('../src/modules/globalSetting/globalSetting.model.js');

const PORTAL_DEFAULTS = {
  key: 'app',
  theme: 'dark',
  fontPreset: 'inter',
  fontSize: 'medium',
  accentColor: 'portal',
};

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aadmin');
  await GlobalSetting.findOneAndUpdate({ key: 'app' }, PORTAL_DEFAULTS, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });
  console.log('Global settings seeded (portal theme):', PORTAL_DEFAULTS);
  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
