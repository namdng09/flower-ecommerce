import { IProduct } from './productModel';
import { productRepository } from './productRepository';
import { variantRepository } from '../variant/variantRepository';
import { userRepository } from '../user/userRepository';
import createHttpError from 'http-errors';
import mongoose, { Types } from 'mongoose';
import { generateSKU } from '~/utils/generateSKU';

export const productService = {
  list: async () => {
    const products = await productRepository.findAll();
    return products;
  },

  filterProducts: async (
    page?: string,
    limit?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    shop?: string,
    title?: string,
    category?: string,
    minPrice?: string,
    maxPrice?: string,
    province?: string,
    ward?: string
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchStage: Record<string, any> = {};

    if (shop) {
      if (!Types.ObjectId.isValid(shop)) {
        throw createHttpError(400, 'Invalid shop id');
      }
      matchStage.shop = new Types.ObjectId(shop);
    }

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

    const aggregate = productRepository.aggregate([
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
          let: { shopId: '$shop._id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$shopId'] },
                    { $eq: ['$isDefault', true] }
                  ]
                }
              }
            },
            { $project: { __v: 0 } }
          ],
          as: 'address'
        }
      },
      { $unwind: { path: '$address', preserveNullAndEmptyArrays: true } },
      // 4. Match theo salePrice sau khi có variants
      ...(min != null || max != null
        ? [
            {
              $match: {
                $expr: {
                  $and: [
                    ...(min != null
                      ? [
                          {
                            $gte: [
                              { $arrayElemAt: ['$variants.salePrice', 0] },
                              min
                            ]
                          }
                        ]
                      : []),
                    ...(max != null
                      ? [
                          {
                            $lte: [
                              { $arrayElemAt: ['$variants.salePrice', 0] },
                              max
                            ]
                          }
                        ]
                      : [])
                  ]
                }
              }
            }
          ]
        : []),

      ...(province || ward
        ? [
            {
              $match: {
                ...(province && {
                  'address.province': { $regex: province, $options: 'i' }
                }),
                ...(ward && {
                  'address.ward': { $regex: ward, $options: 'i' }
                })
              }
            }
          ]
        : [])
    ]);

    const options = {
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10
    };

    const result = await productRepository.aggregatePaginate(
      aggregate,
      options
    );

    return result;
  },

  show: async (productId: string) => {
    if (!Types.ObjectId.isValid(productId))
      throw createHttpError(400, 'Invalid product id');

    const product = await productRepository.findById(productId);
    if (!product) throw createHttpError(404, 'Product not found');

    return product;
  },

  create: async (productData: IProduct) => {
    const {
      title,
      shop,
      status,
      thumbnailImage,
      description,
      image,
      weight,
      dimension,
      categories,
      variants
    } = productData;

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

    const shopExists = await userRepository.findShopWithAddress(
      shop.toString()
    );
    if (!shopExists) throw createHttpError(404, 'Shop not found');

    // if (!Types.ObjectId.isValid(category))
    //   throw createHttpError(400, 'Invalid category id');
    //
    // const categoryExists = await CategoryModel.findById(category);
    // if (!categoryExists) throw createHttpError(404, 'Category not found');

    if (weight <= 0) throw createHttpError(400, 'Weight must be > 0');
    if (dimension.length <= 0 || dimension.width <= 0 || dimension.height <= 0)
      throw createHttpError(400, 'Dimension values must be > 0');

    const createdVariants: Types.ObjectId[] = [];

    for (const variant of variants) {
      const {
        title,
        listPrice,
        salePrice,
        image,
        inventory = 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } = variant as any;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        throw createHttpError(400, 'Variant title is required');
      }

      if (salePrice > listPrice) {
        throw createHttpError(400, 'Sale Price cannot exceed List Price');
      }

      let variantCode = generateSKU();
      while (await variantRepository.findByVariantCode(variantCode)) {
        variantCode = generateSKU();
      }

      const newVariant = await variantRepository.createMany([
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
    }

    let productCode = generateSKU();
    while (await productRepository.findBySKU(productCode)) {
      productCode = generateSKU();
    }

    const product = await productRepository.create({
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

    return product;
  },

  update: async (productId: string, productData: IProduct) => {
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
    } = productData;

    if (!Types.ObjectId.isValid(productId))
      throw createHttpError(400, 'Invalid product id');

    const product = await productRepository.findById(productId);
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
        const {
          title,
          listPrice,
          salePrice,
          image,
          inventory = 0
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } = variant as any;

        if (!title || typeof title !== 'string' || title.trim() === '') {
          throw createHttpError(400, 'Variant title is required');
        }

        if (salePrice > listPrice)
          throw createHttpError(400, 'Sale Price cannot exceed List Price');

        let variantCode = generateSKU();
        while (await variantRepository.findByVariantCode(variantCode)) {
          variantCode = generateSKU();
        }

        const newVariant = await variantRepository.create({
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
    return updated;
  },

  remove: async (productId: string) => {
    if (!Types.ObjectId.isValid(productId))
      throw createHttpError(400, 'Invalid product id');

    const deleted = await productRepository.findByIdAndDelete(productId);
    if (!deleted) throw createHttpError(404, 'Product not found');

    return deleted;
  },

  getByShop: async (shopId: string) => {
    if (!Types.ObjectId.isValid(shopId))
      throw createHttpError(400, 'Invalid shop id');

    const products = await productRepository.findByShop(shopId);
    return products;
  },

  getByCategory: async (categoryId: string) => {
    if (!Types.ObjectId.isValid(categoryId))
      throw createHttpError(400, 'Invalid category id');

    const products = await productRepository.findByCategory(categoryId);

    return products;
  }
};
