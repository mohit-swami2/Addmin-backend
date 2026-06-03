import Product from './product.model.js';
import { buildQueryFilter } from '../../shared/utils/queryBuilder.js';
import { getPaginationOptions, buildPaginationMeta } from '../../shared/utils/pagination.js';

export const listProducts = async (query, req) => {
  const { page, limit, skip, sortStage, sortBy } = getPaginationOptions(query);
  const match = buildQueryFilter(query, Product);

  if (query.minPrice !== undefined) {
    match.price = { ...match.price, $gte: Number(query.minPrice) };
  }
  if (query.maxPrice !== undefined) {
    match.price = { ...match.price, $lte: Number(query.maxPrice) };
  }

  const [result] = await Product.aggregate([
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
  const data = (result?.data || []).map((doc) => {
    const p = new Product(doc);
    return p.toListJSON(req);
  });

  return {
    data,
    pagination: buildPaginationMeta({ page, limit, total, sortBy }),
  };
};

export const createProduct = async (payload) => {
  const exists = await Product.findOne({ sku: payload.sku.toUpperCase(), isDeleted: false });
  if (exists) {
    const err = new Error('SKU already exists');
    err.status = 409;
    throw err;
  }
  const product = await Product.create({ ...payload, sku: payload.sku.toUpperCase() });
  return product;
};

export const updateProduct = async (id, payload) => {
  const taken = await Product.findOne({
    sku: payload.sku.toUpperCase(),
    _id: { $ne: id },
    isDeleted: false,
  });
  if (taken) {
    const err = new Error('SKU already exists');
    err.status = 409;
    throw err;
  }
  const product = await Product.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { ...payload, sku: payload.sku.toUpperCase() },
    { new: true, runValidators: true }
  );
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return product;
};

export const deleteProduct = async (id) => {
  const product = await Product.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Product deleted' };
};
