import { Types } from 'mongoose';
import { Request, Response } from 'express';
import CategoryModel from './categoryModel';
import { apiResponse } from '~/types/apiResponse';

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
  list: async (req: Request, res: Response): Promise<Response> => {
    try {
      const categories = await CategoryModel.find();
      return res
        .status(200)
        .json(
          apiResponse.success('Categories listed successfully', categories)
        );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * GET /categories/:id
   * categoryController.show()
   */
  show: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid category id'));
      }

      const category = await CategoryModel.findById(id);
      if (!category) {
        return res.status(404).json(apiResponse.error('Category not found'));
      }

      return res
        .status(200)
        .json(apiResponse.success('Category fetched successfully', category));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * POST /categories
   * categoryController.create()
   */
  create: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { title, image = '', description = '' } = req.body;

      if (!title?.trim()) {
        return res
          .status(400)
          .json(apiResponse.error('Title field is required'));
      }

      const duplicate = await CategoryModel.findOne({ title });
      if (duplicate) {
        return res
          .status(409)
          .json(apiResponse.error('Category title already exists'));
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * PUT /categories/:id
   * categoryController.update()
   */
  update: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;
      const { title, image, description, status } = req.body;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid category id'));
      }

      const savedCategory = await CategoryModel.findById(id);
      if (!savedCategory) {
        return res.status(404).json(apiResponse.error('Category not found'));
      }

      if (title && title !== savedCategory.title) {
        const dup = await CategoryModel.findOne({ title });
        if (dup) {
          return res
            .status(409)
            .json(
              apiResponse.error('Category title already exists')
            );
        }
      }

      if (title !== undefined) savedCategory.title = title;
      if (image !== undefined) savedCategory.image = image;
      if (description !== undefined) savedCategory.description = description;
      if (status !== undefined) savedCategory.status = status;

      const updatedCategory = await savedCategory.save();

      return res
        .status(200)
        .json(
          apiResponse.success('Category updated successfully', updatedCategory)
        );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  },

  /**
   * DELETE /categories/:id
   * categoryController.remove()
   */
  remove: async (req: Request, res: Response): Promise<Response> => {
    try {
      const { id } = req.params;

      if (!Types.ObjectId.isValid(id)) {
        return res.status(400).json(apiResponse.error('Invalid category id'));
      }

      const deleted = await CategoryModel.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json(apiResponse.error('Category not found'));
      }

      return res
        .status(200)
        .json(apiResponse.success('Category removed successfully'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json(apiResponse.error(message));
    }
  }
};
