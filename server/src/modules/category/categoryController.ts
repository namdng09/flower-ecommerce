import { Types } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import CategoryModel from './categoryModel';
import { apiResponse } from '~/types/apiResponse';
import createHttpError from 'http-errors';

/**
 * categoryController.ts
 *
 * @description :: Server-side logic for managing categories.
 */
export const categoryController = {
  /**
   * GET /categories
   * categoryController.list()
   */
  list: async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const categories = await CategoryModel.find();
      return res
        .status(200)
        .json(apiResponse.success('Categories listed successfully', categories));
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /categories/:id
   * categoryController.show()
   */
  show: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid category id');
      }

      const category = await CategoryModel.findById(id);
      if (!category) {
        throw createHttpError(404, 'Category not found');
      }

      return res
        .status(200)
        .json(apiResponse.success('Category fetched successfully', category));
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /categories
   * categoryController.create()
   */
  create: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { title, image = '', description = '' } = req.body;

      if (!title?.trim()) {
        throw createHttpError(400, 'Title field is required');
      }

      const duplicate = await CategoryModel.findOne({ title });
      if (duplicate) {
        throw createHttpError(409, 'Category title already exists');
      }

      const category = await CategoryModel.create({
        title,
        image,
        description
      });

      return res
        .status(201)
        .json(apiResponse.success('Category created successfully', category));
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /categories/:id
   * categoryController.update()
   */
  update: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const { title, image, description, status } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid category id');
      }

      const savedCategory = await CategoryModel.findById(id);
      if (!savedCategory) {
        throw createHttpError(404, 'Category not found');
      }

      if (title && title !== savedCategory.title) {
        const dup = await CategoryModel.findOne({ title });
        if (dup) {
          throw createHttpError(409, 'Category title already exists');
        }
      }

      if (title !== undefined) savedCategory.title = title;
      if (image !== undefined) savedCategory.image = image;
      if (description !== undefined) savedCategory.description = description;
      if (status !== undefined) savedCategory.status = status;

      const updatedCategory = await savedCategory.save();

      return res
        .status(200)
        .json(apiResponse.success('Category updated successfully', updatedCategory));
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /categories/:id
   * categoryController.remove()
   */
  remove: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        throw createHttpError(400, 'Invalid category id');
      }

      const deleted = await CategoryModel.findByIdAndDelete(id);
      if (!deleted) {
        throw createHttpError(404, 'Category not found');
      }

      return res
        .status(200)
        .json(apiResponse.success('Category removed successfully'));
    } catch (error) {
      next(error);
    }
  }
};
