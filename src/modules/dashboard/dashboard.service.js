import User from '../user/user.model.js';
import Product from '../product/product.model.js';

export const getOverview = async () => {
  const [userStats, productStats, revenueByCategory, recentProducts] = await Promise.all([
    User.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
        },
      },
    ]),
    Product.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          revenue: { $sum: { $multiply: ['$price', '$stock'] } },
        },
      },
    ]),
    Product.aggregate([
      { $match: { isDeleted: false, status: 'Active' } },
      {
        $group: {
          _id: '$category',
          value: { $sum: { $multiply: ['$price', '$stock'] } },
        },
      },
      { $project: { name: '$_id', value: { $round: ['$value', 2] }, _id: 0 } },
    ]),
    Product.find({ isDeleted: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name price status'),
  ]);

  const users = userStats[0] || { total: 0, active: 0 };
  const products = productStats[0] || { total: 0, revenue: 0 };

  return {
    stats: {
      totalUsers: users.total,
      activeUsers: users.active,
      totalProducts: products.total,
      revenue: Math.round(products.revenue * 100) / 100,
    },
    revenueByCategory,
    recentTransactions: recentProducts.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      amount: `$${p.price.toFixed(2)}`,
      status: p.status === 'Active' ? 'Completed' : p.status,
    })),
  };
};
