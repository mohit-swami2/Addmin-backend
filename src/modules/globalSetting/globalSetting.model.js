import mongoose from 'mongoose';

const globalSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'app' },
    theme: { type: String, default: 'dark' },
    fontPreset: { type: String, default: 'inter' },
    fontSize: { type: String, default: 'medium' },
    accentColor: { type: String, default: 'portal' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const GlobalSetting = mongoose.model('GlobalSetting', globalSettingSchema);
export default GlobalSetting;
