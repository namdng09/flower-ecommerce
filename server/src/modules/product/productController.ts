import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import ProductModel from './productModel';
import VariantModel from '../variant/variantModel';
import { apiResponse } from '~/types/apiResponse';
import UserModel from '../user/userModel';
import CategoryModel from '../category/categoryModel';

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
  list: async (req: Request, res: Response) => {
    try {
      const products = await ProductModel.find().populate(
        'category shop variants'
      );
      return res
        .status(200)
        .json(apiResponse.success('Product listed successfully', products));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * GET /products
   * productController.show()
   */
  show: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id))
        return res.status(400).json(apiResponse.error('Invalid product id'));

      const product = await ProductModel.findById(id).populate(
        'category shop variants'
      );
      if (!product)
        return res.status(404).json(apiResponse.error('Product not found'));

      return res
        .status(200)
        .json(apiResponse.success('Product detail', product));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * POST /products
   * productController.create()
   */
  create: async (req: Request, res: Response) => {
    // Start session
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        title,
        shop,
        skuCode,
        category,
        status,
        thumbnailImage,
        description,
        image,
        weight,
        dimension = {},
        variants = []
      } = req.body;

      if (
        !title ||
        !shop ||
        !skuCode ||
        !category ||
        !thumbnailImage ||
        !image ||
        !weight ||
        !dimension.length ||
        !dimension.width ||
        !dimension.height
      ) {
        return res
          .status(400)
          .json(apiResponse.error('Missing required fields'));
      }

      if (!Types.ObjectId.isValid(shop)) {
        return res.status(400).json(apiResponse.error('Invalid shop id'));
      }

      const shopExists = await UserModel.findOne({ _id: shop, role: 'shop' });
      if (!shopExists) {
        return res.status(404).json(apiResponse.error('Shop not found'));
      }

      if (!Types.ObjectId.isValid(category)) {
        return res.status(400).json(apiResponse.error('Invalid category id'));
      }

      const categoryExists = await CategoryModel.findById(category);
      
      if (!categoryExists) {
        return res.status(404).json(apiResponse.error('Category not found'));
      }

      if (await ProductModel.findOne({ skuCode })) {
        return res
          .status(409)
          .json(apiResponse.error(`SKU Code '${skuCode}' already exists`));
      }

      if (weight <= 0) {
        return res.status(400).json(apiResponse.error('Weight must be > 0'));
      }
      if (
        dimension.length <= 0 ||
        dimension.width <= 0 ||
        dimension.height <= 0
      ) {
        return res
          .status(400)
          .json(apiResponse.error('Dimension values must be > 0'));
      }

      const createdVariants: Types.ObjectId[] = [];
      for (const variant of variants) {
        const {
          variantCode,
          attributes,
          listPrice,
          salePrice,
          image,
          inventory = 0
        } = variant;

        if (!variantCode?.trim() || !attributes || salePrice > listPrice) {
          return res
            .status(400)
            .json(apiResponse.error('Invalid variant input'));
        }

        const exists = await VariantModel.findOne({ variantCode });
        if (exists) {
          return res
            .status(409)
            .json(
              apiResponse.error(`Variant code '${variantCode}' already exists`)
            );
        }

        const newVariant = await VariantModel.create({
          variantCode,
          attributes,
          listPrice,
          salePrice,
          image,
          inventory
        });

        createdVariants.push(newVariant._id);
      }

      const product = await ProductModel.create({
        title,
        shop,
        skuCode,
        category,
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
      await session.abortTransaction(); // rollback!
      session.endSession();
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * PUT /products/:id
   * productController.update()
   */
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        title,
        category,
        status,
        thumbnailImage,
        description,
        image,
        weight,
        dimension,
        variants
      } = req.body;

      if (!Types.ObjectId.isValid(id))
        return res.status(400).json(apiResponse.error('Invalid product id'));

      const product = await ProductModel.findById(id);
      if (!product)
        return res.status(404).json(apiResponse.error('Product not found'));

      if (
        !title ||
        !category ||
        !thumbnailImage ||
        !image ||
        !weight ||
        !dimension.length ||
        !dimension.width ||
        !dimension.height
      ) {
        return res
          .status(400)
          .json(apiResponse.error('Missing required fields'));
      }

      if (weight <= 0) {
        return res.status(400).json(apiResponse.error('Weight must be > 0'));
      }
      if (
        dimension.length <= 0 ||
        dimension.width <= 0 ||
        dimension.height <= 0
      ) {
        return res
          .status(400)
          .json(apiResponse.error('Dimension values must be > 0'));
      }

      if (variants && Array.isArray(variants)) {
        const createdVariants: Types.ObjectId[] = [];

        for (const variant of variants) {
          const {
            variantCode,
            attributes,
            listPrice,
            salePrice,
            image,
            inventory = 0
          } = variant;

          if (!variantCode?.trim() || !attributes || salePrice > listPrice) {
            return res
              .status(400)
              .json(apiResponse.error('Invalid variant input'));
          }

          if (await VariantModel.findOne({ variantCode })) {
            return res
              .status(409)
              .json(
                apiResponse.error(
                  `Variant code '${variantCode}' already exists`
                )
              );
          }

          const newVariant = await VariantModel.create({
            variantCode,
            attributes,
            listPrice,
            salePrice,
            image,
            inventory
          });

          createdVariants.push(newVariant._id);
        }

        product.variants = createdVariants;
      } else if (variants !== undefined) {
        return res
          .status(400)
          .json(apiResponse.error('Variants must be an array'));
      }

      if (title !== undefined) product.title = title;
      if (category !== undefined) product.category = category;
      if (status !== undefined) product.status = status;
      if (thumbnailImage !== undefined) product.thumbnailImage = thumbnailImage;
      if (description !== undefined) product.description = description;
      if (image !== undefined) product.image = image;

      if (weight !== undefined) {
        if (weight < 0) {
          return res.status(400).json(apiResponse.error('Weight must be >= 0'));
        }
        product.weight = weight;
      }

      if (dimension !== undefined) {
        const { length, width, height } = dimension;
        if (
          length === undefined ||
          width === undefined ||
          height === undefined ||
          length <= 0 ||
          width <= 0 ||
          height <= 0
        ) {
          return res
            .status(400)
            .json(apiResponse.error('Dimension values must be > 0'));
        }
        product.dimension = { length, width, height };
      }

      const updated = await product.save();
      return res
        .status(200)
        .json(apiResponse.success('Product updated', updated));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * DELETE /products/:id
   * productController.remove()
   */
  remove: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id))
        return res.status(400).json(apiResponse.error('Invalid product id'));

      const deleted = await ProductModel.findByIdAndDelete(id);
      if (!deleted)
        return res.status(404).json(apiResponse.error('Product not found'));

      return res
        .status(200)
        .json(apiResponse.success('Product deleted successfully'));
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },

  /** GET /products/shop/:shopId */
  getByShop: async (req: Request, res: Response) => {
    try {
      const { shopId } = req.params;
      if (!Types.ObjectId.isValid(shopId))
        return res.status(400).json(apiResponse.error('Invalid shop id'));

      const products = await ProductModel.find({ shop: shopId }).populate(
        'category'
      );
      return res
        .status(200)
        .json(apiResponse.success('Shop products', products));
    } catch (error) {
      return res.status(500).json(apiResponse.error((error as Error).message));
    }
  },

  /** GET /products/category/:categoryId */
  getByCategory: async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;

      if (!Types.ObjectId.isValid(categoryId))
        return res.status(400).json(apiResponse.error('Invalid category id'));

      const products = await ProductModel.find({
        category: categoryId
      }).populate('shop');
      return res
        .status(200)
        .json(apiResponse.success('Category products', products));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  }
};
