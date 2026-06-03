import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const { default: Admin } = await import('../src/modules/admin/admin.model.js');

/**
 * Production-safe seed: creates only the AAdmin account from env vars.
 * Optional demo data when SEED_SAMPLE_DATA=true
 */
const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aadmin');

  const email = (process.env.DEFAULT_ADMIN_EMAIL || 'aadmin@mailinator.com').toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD || 'aadmin@12345';
  const name = process.env.DEFAULT_ADMIN_NAME || 'AAdmin';

  let admin = await Admin.findOne({ email });
  if (!admin) {
    admin = await Admin.create({
      name,
      firstName: name,
      email,
      password,
      role: 'Admin',
      phone: '+1 234 567 8900',
      location: 'New York, USA',
      bio: 'System administrator for AAdmin.',
      website: 'https://aadmin.com',
      provider: 'local',
    });
    console.log('AAdmin account created:', email);
  } else {
    admin = await Admin.findOne({ email }).select('+password');
    admin.password = password;
    admin.name = name;
    admin.firstName = name;
    await admin.save();
    console.log('AAdmin account updated (password reset from env):', email);
  }

  if (process.env.SEED_SAMPLE_DATA === 'true') {
    const { default: User } = await import('../src/modules/user/user.model.js');
    const { default: Product } = await import('../src/modules/product/product.model.js');

    if ((await User.countDocuments()) === 0) {
      await User.insertMany([
        { name: 'John Doe', email: 'john@example.com', role: 'Editor', status: 'Active' },
        { name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
        { name: 'Mike Wilson', email: 'mike@example.com', role: 'User', status: 'Pending' },
      ]);
      console.log('Sample users seeded');
    }

    if ((await Product.countDocuments()) === 0) {
      await Product.insertMany([
        {
          name: 'Wireless Headphones',
          sku: 'WH-001',
          category: 'Electronics',
          price: 149.99,
          stock: 45,
          status: 'Active',
          description: 'Premium noise-cancelling wireless headphones.',
        },
        {
          name: 'Cotton T-Shirt',
          sku: 'CT-002',
          category: 'Clothing',
          price: 29.99,
          stock: 120,
          status: 'Active',
          description: 'Comfortable 100% cotton t-shirt.',
        },
      ]);
      console.log('Sample products seeded');
    }
  }

  const { default: GlobalSetting } = await import('../src/modules/globalSetting/globalSetting.model.js');
  await GlobalSetting.findOneAndUpdate(
    { key: 'app' },
    { theme: 'dark', fontPreset: 'inter', fontSize: 'medium', accentColor: 'portal' },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Portal global settings ensured');

  await mongoose.disconnect();
  console.log('Seed complete');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
