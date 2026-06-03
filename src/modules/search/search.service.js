import * as userService from '../user/user.service.js';
import * as productService from '../product/product.service.js';

const DEFAULT_LIMIT = 5;

export const globalSearch = async ({ q, limit = DEFAULT_LIMIT }) => {
  const query = { search: q, page: 1, limit };

  const [usersResult, productsResult] = await Promise.all([
    userService.listUsers(query),
    productService.listProducts(query, null),
  ]);

  return {
    users: usersResult.data,
    products: productsResult.data,
    meta: {
      query: q,
      limit,
      counts: {
        users: usersResult.data.length,
        products: productsResult.data.length,
      },
    },
  };
};
