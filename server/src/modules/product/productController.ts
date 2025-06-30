import { NextFunction, Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import ProductModel from './productModel';
import VariantModel from '../variant/variantModel';
import { apiResponse } from '~/types/apiResponse';
import UserModel from '../user/userModel';
import CategoryModel from '../category/categoryModel';
import createHttpError from 'http-errors';
import { generateSKU } from '~/utils/generateSKU';

/**
 * productController.ts
 *
 * @description :: Server-side logic for managing products.
 */
export const productController = {
  /**
   * GET /products
   * productController.list()
   */
  list: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const products = await ProductModel.find().populate(
        'categories shop variants'
      );
      return res
        .status(200)
        .json(apiResponse.success('Product listed successfully', products));
    } catch (error) {
      next(error);
    }
  },

  filterProducts: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const {
        page = '1',
        limit = '10',
        sortBy = 'createdAt',
        sortOrder = 'desc',
        title,
        category,
        minPrice,
        maxPrice
      } = req.query;

      const matchStage: any = {};

      if (title) {
        matchStage.title = { $regex: title, $options: 'i' };
      }

      if (category) {
        const categoryIds = (category as string)
          .split(',')
          .map(id => new mongoose.Types.ObjectId(id));
        matchStage.categories = { $all: categoryIds };
      }

      const min = minPrice ? parseFloat(minPrice as string) : null;
      const max = maxPrice ? parseFloat(maxPrice as string) : null;

      if (min != null || max != null) {
        matchStage.$expr = {
          $and: []
        };
        if (min != null) {
          matchStage.$expr.$and.push({
            $gte: [{ $arrayElemAt: ['$variants.salePrice', 0] }, min]
          });
        }
        if (max != null) {
          matchStage.$expr.$and.push({
            $lte: [{ $arrayElemAt: ['$variants.salePrice', 0] }, max]
          });
        }
      }

      const aggregate = ProductModel.aggregate([
        { $match: matchStage },
        {
          $sort: {
            [sortBy as string]: sortOrder === 'asc' ? 1 : -1
          }
        },
        {
          $lookup: {
            from: 'users',
            let: { shopId: '$shop' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$_id', '$$shopId'] },
                      { $eq: ['$role', 'shop'] }
                    ]
                  }
                }
              },
              {
                $project: {
                  password: 0
                }
              }
            ],
            as: 'shop'
          }
        },
        { $unwind: { path: '$shop', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'variants',
            localField: 'variants',
            foreignField: '_id',
            as: 'variants'
          }
        },
        {
          $lookup: {
            from: 'addresses',
            localField: 'shop',
            foreignField: 'userId',
            as: 'addresses'
          }
        }
      ]);

      const options = {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10
      };

      const result = await (ProductModel as any).aggregatePaginate(
        aggregate,
        options
      );

      return res.status(200).json(
        apiResponse.success('Product listed successfully', {
          result
        })
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /products
   * productController.show()
   */
  show: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id))
        throw createHttpError(400, 'Invalid product id');

      const product = await ProductModel.findById(id).populate(
        'categories shop variants'
      );
      if (!product) throw createHttpError(404, 'Product not found');

      return res
        .status(200)
        .json(apiResponse.success('Product detail', product));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /products
   * productController.create()
   */
  create: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const {
        title,
        shop,
        status,
        thumbnailImage,
        description,
        image,
        weight,
        dimension = {},
        categories = [],
        variants = []
      } = req.body;

      if (
        !title ||
        !shop ||
        !categories ||
        !thumbnailImage ||
        !image ||
        !weight ||
        typeof dimension !== 'object' ||
        !dimension.length ||
        !dimension.width ||
        !dimension.height
      ) {
        throw createHttpError(400, 'Missing required fields');
      }

      if (!Types.ObjectId.isValid(shop))
        throw createHttpError(400, 'Invalid shop id');

      const shopExists = await UserModel.findOne({ _id: shop, role: 'shop' });
      if (!shopExists) throw createHttpError(404, 'Shop not found');

      // if (!Types.ObjectId.isValid(category))
      //   throw createHttpError(400, 'Invalid category id');
      //
      // const categoryExists = await CategoryModel.findById(category);
      // if (!categoryExists) throw createHttpError(404, 'Category not found');

      if (weight <= 0) throw createHttpError(400, 'Weight must be > 0');
      if (
        dimension.length <= 0 ||
        dimension.width <= 0 ||
        dimension.height <= 0
      )
        throw createHttpError(400, 'Dimension values must be > 0');

      const createdVariants: Types.ObjectId[] = [];

      for (const variant of variants) {
        const { title, listPrice, salePrice, image, inventory = 0 } = variant;

        if (!title || typeof title !== 'string' || title.trim() === '') {
          throw createHttpError(400, 'Variant title is required');
        }

        if (salePrice > listPrice) {
          throw createHttpError(400, 'Sale Price cannot exceed List Price');
        }

        let variantCode = generateSKU();
        while (await VariantModel.findOne({ variantCode })) {
          variantCode = generateSKU();
        }

        try {
          const newVariant = await VariantModel.create([
            {
              variantCode,
              title,
              listPrice,
              salePrice,
              image,
              inventory
            }
          ]);
          createdVariants.push(newVariant[0]._id);
        } catch (error) {
          next(error);
        }
      }

      let productCode = generateSKU();
      while (await ProductModel.findOne({ skuCode: productCode })) {
        productCode = generateSKU();
      }

      const product = await ProductModel.create({
        title,
        shop,
        skuCode: productCode,
        categories,
        status,
        thumbnailImage,
        description,
        image,
        weight,
        dimension,
        variants: createdVariants
      });

      return res
        .status(201)
        .json(apiResponse.success('Product created with variants', product));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /products/:id
   * productController.update()
   */
  update: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const {
        title,
        categories,
        status,
        thumbnailImage,
        description,
        image,
        weight,
        dimension,
        variants
      } = req.body;

      if (!Types.ObjectId.isValid(id))
        throw createHttpError(400, 'Invalid product id');

      const product = await ProductModel.findById(id);
      if (!product) throw createHttpError(404, 'Product not found');

      if (
        !title ||
        !categories ||
        !thumbnailImage ||
        !image ||
        !weight ||
        !dimension.length ||
        !dimension.width ||
        !dimension.height
      ) {
        throw createHttpError(400, 'Missing required fields');
      }

      if (weight <= 0) throw createHttpError(400, 'Weight must be > 0');
      if (
        dimension.length <= 0 ||
        dimension.width <= 0 ||
        dimension.height <= 0
      ) {
        throw createHttpError(400, 'Dimension values must be > 0');
      }

      if (variants !== undefined) {
        if (!Array.isArray(variants))
          throw createHttpError(400, 'Variants must be an array');

        const createdVariants: Types.ObjectId[] = [];

        for (const variant of variants) {
          const { title, listPrice, salePrice, image, inventory = 0 } = variant;

          if (!title || typeof title !== 'string' || title.trim() === '') {
            throw createHttpError(400, 'Variant title is required');
          }

          if (salePrice > listPrice)
            throw createHttpError(400, 'Sale Price cannot exceed List Price');

          let variantCode = generateSKU();
          while (await VariantModel.findOne({ variantCode })) {
            variantCode = generateSKU();
          }

          const newVariant = await VariantModel.create({
            variantCode,
            title,
            listPrice,
            salePrice,
            image,
            inventory
          });
          createdVariants.push(newVariant._id);
        }

        product.variants = createdVariants;
      }

      product.title = title;
      product.categories = categories;
      product.status = status;
      product.thumbnailImage = thumbnailImage;
      product.description = description;
      product.image = image;
      product.weight = weight;
      product.dimension = dimension;

      const updated = await product.save();
      return res
        .status(200)
        .json(apiResponse.success('Product updated', updated));
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /products/:id
   * productController.remove()
   */
  remove: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id))
        throw createHttpError(400, 'Invalid product id');

      const deleted = await ProductModel.findByIdAndDelete(id);
      if (!deleted) throw createHttpError(404, 'Product not found');

      return res
        .status(200)
        .json(apiResponse.success('Product deleted successfully'));
    } catch (error) {
      next(error);
    }
  },

  /** GET /products/shop/:shopId */
  getByShop: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { shopId } = req.params;
      if (!Types.ObjectId.isValid(shopId))
        throw createHttpError(400, 'Invalid shop id');

      const products = await ProductModel.find({ shop: shopId }).populate(
        'categories'
      );
      return res
        .status(200)
        .json(apiResponse.success('Shop products', products));
    } catch (error) {
      next(error);
    }
  },

  /** GET /products/category/:categoryId */
  getByCategory: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { categoryId } = req.params;

      if (!Types.ObjectId.isValid(categoryId))
        throw createHttpError(400, 'Invalid category id');

      const products = await ProductModel.find({
        categories: categoryId
      }).populate('shop');
      return res
        .status(200)
        .json(apiResponse.success('Category products', products));
    } catch (error) {
      next(error);
    }
  }
};
