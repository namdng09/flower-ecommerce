import { NextFunction, Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import ProductModel, { IProduct } from './productModel';
import VariantModel from '../variant/variantModel';
import { apiResponse } from '~/types/apiResponse';
import UserModel from '../user/userModel';
import CategoryModel from '../category/categoryModel';
import createHttpError from 'http-errors';
import { generateSKU } from '~/utils/generateSKU';
import { productService } from './productService';

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
      const products = await productService.list();

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
        maxPrice,
        province,
        ward
      } = req.query as {
        page?: string;
        limit?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        title?: string;
        category?: string;
        minPrice?: string;
        maxPrice?: string;
        province?: string;
        ward?: string;
      };

      const result = await productService.filterProducts(
        page,
        limit,
        sortBy,
        sortOrder,
        title,
        category,
        minPrice,
        maxPrice,
        province,
        ward
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

      const product = await productService.show(id);

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
      const productData: IProduct = req.body;

      const product = await productService.create(productData);

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
      const productData: IProduct = req.body;

      const updated = await productService.update(id, productData);

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

      const deleted = await productService.remove(id);

      return res
        .status(200)
        .json(apiResponse.success('Product deleted successfully', deleted));
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

      const products = await productService.getByShop(shopId);

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

      const products = await productService.getByCategory(categoryId);

      return res
        .status(200)
        .json(apiResponse.success('Category products', products));
    } catch (error) {
      next(error);
    }
  }
};
