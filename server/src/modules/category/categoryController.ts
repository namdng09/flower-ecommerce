import { Request, Response, NextFunction } from 'express';
import { categoryService } from './categoryService';
import { apiResponse } from '~/types/apiResponse';
import { ICategory } from './categoryModel';

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
    const categories = await categoryService.list();

    return res
      .status(200)
      .json(apiResponse.success('Categories listed successfully', categories));
  },
  /**
   * GET /categories/:id
   * categoryController.show()
   */
  show: async (req: Request, res: Response): Promise<Response> => {
    const { categoryId } = req.params;

    const category = await categoryService.show(categoryId);

    return res
      .status(200)
      .json(apiResponse.success('Category fetched successfully', category));
  },
  /**
   * GET /categories/filter
   * categoryController.filterCategories()
   */
  filterCategories: async (req: Request, res: Response): Promise<Response> => {
    const {
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      title
    } = req.query as {
      page?: string;
      limit?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      title?: string;
    };

    const categories = await categoryService.filter(
      page,
      limit,
      sortBy,
      sortOrder,
      title
    );

    return res
      .status(200)
      .json(
        apiResponse.success('Categories filtered successfully', categories)
      );
  },
  /**
   * POST /categories
   * categoryController.create()
   */
  create: async (req: Request, res: Response): Promise<Response> => {
    const categoryData: ICategory = req.body;

    const newCategory = await categoryService.create(categoryData);

    return res
      .status(201)
      .json(apiResponse.success('Category created successfully', newCategory));
  },
  /**
   * PUT /categories/:id
   * categoryController.update()
   */
  update: async (req: Request, res: Response): Promise<Response> => {
    const { categoryId } = req.params;
    const categoryData: ICategory = req.body;

    const category = await categoryService.update(categoryId, categoryData);

    return res
      .status(200)
      .json(apiResponse.success('Category updated successfully', category));
  },
  /**
   * DELETE /categories/:id
   * categoryController.delete()
   */
  delete: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { categoryId } = req.params;

      const category = await categoryService.delete(categoryId);

      return res
        .status(200)
        .json(apiResponse.success('Category deleted successfully', category));
    } catch (error) {
      next(error);
    }
  },
  /**
   * GET /categories/parents
   * categoryController.parents()
   */
  parents: async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const parents = await categoryService.parents();
      return res
        .status(200)
        .json(
          apiResponse.success('Parent categories listed successfully', parents)
        );
    } catch (error) {
      next(error);
    }
  },
  /**
   * GET /categories/:parentId/children
   * categoryController.children()
   */
  children: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    try {
      const { parentId } = req.params;
      if (!parentId) {
        throw new Error('Parent ID is required');
      }

      const children = await categoryService.children(parentId);
      return res
        .status(200)
        .json(
          apiResponse.success('Subcategories listed successfully', children)
        );
    } catch (error) {
      next(error);
    }
  }
};
