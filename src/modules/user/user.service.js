import User from './user.model.js';
import { buildQueryFilter } from '../../shared/utils/queryBuilder.js';
import { getPaginationOptions, buildPaginationMeta } from '../../shared/utils/pagination.js';

export const listUsers = async (query) => {
  const { page, limit, skip, sortStage, sortBy } = getPaginationOptions(query);
  const match = buildQueryFilter(query, User);

  const [result] = await User.aggregate([
    { $match: match },
    { $sort: sortStage },
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        meta: [{ $count: 'total' }],
      },
    },
    {
      $project: {
        data: 1,
        total: { $ifNull: [{ $arrayElemAt: ['$meta.total', 0] }, 0] },
      },
    },
  ]);

  const total = result?.total || 0;
  const data = (result?.data || []).map((doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    status: doc.status,
    createdAt: doc.createdAt,
  }));

  return {
    data,
    pagination: buildPaginationMeta({ page, limit, total, sortBy }),
  };
};

export const createUser = async (payload) => {
  const exists = await User.findOne({ email: payload.email.toLowerCase(), isDeleted: false });
  if (exists) {
    const err = new Error('Email already exists');
    err.status = 409;
    throw err;
  }
  const user = await User.create(payload);
  return user.toListJSON();
};

export const updateUser = async (id, payload) => {
  const taken = await User.findOne({
    email: payload.email.toLowerCase(),
    _id: { $ne: id },
    isDeleted: false,
  });
  if (taken) {
    const err = new Error('Email already exists');
    err.status = 409;
    throw err;
  }
  const user = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true, runValidators: true }
  );
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return user.toListJSON();
};

export const deleteUser = async (id) => {
  const user = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  return { message: 'User deleted' };
};
