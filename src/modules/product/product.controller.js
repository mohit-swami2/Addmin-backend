import { sendSuccess } from '../../shared/utils/response.js';
import * as productService from './product.service.js';
import { serializeProduct } from '../../shared/utils/fileUrl.js';
import { persistUploadedFile, removeStoredFile } from '../../shared/services/storage.js';
import Product from './product.model.js';

export const list = async (req, res, next) => {
  try {
    const result = await productService.listProducts(req.parsedQuery || req.query, req);
    return sendSuccess(res, {
      message: 'Products fetched',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const create = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return sendSuccess(res, {
      status: 201,
      message: 'Product created',
      data: [await serializeProduct(product, req)],
    });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const update = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.parsedParams?.id || req.params.id, req.body);
    return sendSuccess(res, {
      message: 'Product updated',
      data: [await serializeProduct(product, req)],
    });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await productService.deleteProduct(req.parsedParams?.id || req.params.id);
    return sendSuccess(res, { message: result.message, data: [] });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};

export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return next({ status: 400, message: 'Image file is required' });
    const id = req.parsedParams?.id || req.params.id;
    const existing = await Product.findOne({ _id: id, isDeleted: false });
    const storageKey = await persistUploadedFile(req.file, 'products');
    const product = await productService.updateProductImage(id, storageKey);
    if (existing?.image) await removeStoredFile(existing.image);
    return sendSuccess(res, {
      message: 'Product image uploaded',
      data: [await serializeProduct(product, req)],
    });
  } catch (err) {
    next({ status: err.status || 500, message: err.message });
  }
};
