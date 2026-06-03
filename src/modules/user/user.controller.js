import { sendSuccess } from '../../shared/utils/response.js';
import * as userService from './user.service.js';

export const list = async (req, res, next) => {
  try {
    const result = await userService.listUsers(req.parsedQuery || req.query);
    return sendSuccess(res, {
      message: 'Users fetched',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const create = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return sendSuccess(res, { status: 201, message: 'User created', data: [user] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const update = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.parsedParams?.id || req.params.id, req.body);
    return sendSuccess(res, { message: 'User updated', data: [user] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.parsedParams?.id || req.params.id);
    return sendSuccess(res, { message: result.message, data: [] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};
