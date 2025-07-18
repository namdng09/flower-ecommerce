import OrderModel from '~/modules/order/orderModel';
import mongoose from 'mongoose';

interface RevenueQueryOptions {
  startDate?: Date;
  endDate?: Date;
  shopId?: string;
  page?: number;
  limit?: number;
}

interface TimeframeOptions extends RevenueQueryOptions {
  groupBy: 'day' | 'month' | 'year';
}

type MatchStage = {
  'payment.status': string;
  createdAt?: {
    $gte: Date;
    $lte: Date;
  };
  shop?: mongoose.Types.ObjectId;
};

export const revenueService = {
  async getOverallRevenue(options: RevenueQueryOptions = {}) {
    const { startDate, endDate, shopId } = options;

    const matchStage: MatchStage = {
      'payment.status': 'paid'
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    if (shopId) {
      matchStage.shop = new mongoose.Types.ObjectId(shopId);
    }

    const result = await OrderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$payment.amount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$payment.amount' }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          orderCount: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] }
        }
      }
    ]);

    return (
      result[0] || { totalRevenue: 0, orderCount: 0, averageOrderValue: 0 }
    );
  },

  async getRevenueByTimeframe(options: TimeframeOptions) {
    const {
      startDate,
      endDate,
      groupBy,
      shopId,
      page = 1,
      limit = 10
    } = options;

    const matchStage: MatchStage = {
      'payment.status': 'paid'
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    if (shopId) {
      matchStage.shop = new mongoose.Types.ObjectId(shopId);
    }

    const aggregateQuery = OrderModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          convertedDate: { $toDate: '$createdAt' }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format:
                groupBy === 'day'
                  ? '%Y-%m-%d'
                  : groupBy === 'year'
                    ? '%Y'
                    : '%Y-%m',
              date: '$convertedDate'
            }
          },
          totalRevenue: { $sum: '$payment.amount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          date: '$_id',
          totalRevenue: 1,
          orderCount: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    const paginateOptions = {
      page,
      limit,
      customLabels: {
        totalDocs: 'totalRecords',
        docs: 'records'
      }
    };

    const result = await OrderModel.aggregatePaginate(
      aggregateQuery,
      paginateOptions
    );

    return result;
  },

  async getRevenueByShop(options: RevenueQueryOptions = {}) {
    const { startDate, endDate, page = 1, limit = 10 } = options;

    const matchStage: MatchStage = {
      'payment.status': 'paid'
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const aggregateQuery = OrderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$shop',
          totalRevenue: { $sum: '$payment.amount' },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: '$payment.amount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'shopDetails'
        }
      },
      { $unwind: { path: '$shopDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          shopId: '$_id',
          shopName: '$shopDetails.name',
          totalRevenue: 1,
          orderCount: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          _id: 0
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    const paginateOptions = {
      page,
      limit,
      customLabels: {
        totalDocs: 'totalShops',
        docs: 'shops'
      }
    };

    const result = await OrderModel.aggregatePaginate(
      aggregateQuery,
      paginateOptions
    );
    return result;
  },

  async getRevenueByShopTimeframe(options: TimeframeOptions) {
    const {
      startDate,
      endDate,
      groupBy,
      shopId,
      page = 1,
      limit = 10
    } = options;

    const matchStage: MatchStage = {
      'payment.status': 'paid'
    };

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: startDate,
        $lte: endDate
      };
    }

    if (shopId) {
      matchStage.shop = new mongoose.Types.ObjectId(shopId);
    }

    // Ensure valid date conversion for createdAt
    const aggregateQuery = OrderModel.aggregate([
      { $match: matchStage },
      {
        $addFields: {
          convertedDate: { $toDate: '$createdAt' }
        }
      },
      {
        $group: {
          _id: {
            shop: '$shop',
            date: {
              $dateToString: {
                format: groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m',
                date: '$convertedDate'
              }
            }
          },
          totalRevenue: { $sum: '$payment.amount' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.shop',
          foreignField: '_id',
          as: 'shopDetails'
        }
      },
      { $unwind: { path: '$shopDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          shopId: '$_id.shop',
          shopName: '$shopDetails.name',
          date: '$_id.date',
          totalRevenue: 1,
          orderCount: 1,
          _id: 0
        }
      },
      { $sort: { shopId: 1, date: 1 } }
    ]);

    const paginateOptions = {
      page,
      limit,
      customLabels: {
        totalDocs: 'totalRecords',
        docs: 'records'
      }
    };

    const result = await OrderModel.aggregatePaginate(
      aggregateQuery,
      paginateOptions
    );

    return result;
  }
};
