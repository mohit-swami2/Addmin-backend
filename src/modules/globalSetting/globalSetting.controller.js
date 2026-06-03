import { sendSuccess } from '../../shared/utils/response.js';
import * as globalSettingService from './globalSetting.service.js';

export const getPublic = async (req, res, next) => {
  try {
    const settings = await globalSettingService.getSettings();
    return sendSuccess(res, { message: 'Settings fetched', data: [settings] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const save = async (req, res, next) => {
  try {
    const settings = await globalSettingService.saveSettings(req.body);
    return sendSuccess(res, { message: 'Settings saved', data: [settings] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};
