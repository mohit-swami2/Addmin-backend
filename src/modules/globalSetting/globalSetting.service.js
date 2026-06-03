import GlobalSetting from './globalSetting.model.js';

const SETTINGS_KEY = 'app';

export const getSettings = async () => {
  let settings = await GlobalSetting.findOne({ key: SETTINGS_KEY, isDeleted: false });
  if (!settings) {
    settings = await GlobalSetting.create({ key: SETTINGS_KEY });
  }
  return {
    theme: settings.theme,
    fontPreset: settings.fontPreset,
    fontSize: settings.fontSize,
    accentColor: settings.accentColor,
  };
};

export const saveSettings = async (payload) => {
  const settings = await GlobalSetting.findOneAndUpdate(
    { key: SETTINGS_KEY, isDeleted: false },
    payload,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return {
    theme: settings.theme,
    fontPreset: settings.fontPreset,
    fontSize: settings.fontSize,
    accentColor: settings.accentColor,
  };
};
