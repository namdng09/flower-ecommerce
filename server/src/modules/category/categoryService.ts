import CategoryModel, { ICategory } from './categoryModel';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

export const categoryService = {
    list: async () => {
        const categories = await CategoryModel.find();
        if (!categories || categories.length === 0) {
            throw createHttpError(404, 'No category found');
        }
        return categories;
    },

    show: async (categoryId: string) => {
        if (!Types.ObjectId.isValid(categoryId)) {
            throw createHttpError(400, 'Invalid category id');
        }
        const category = await CategoryModel.findById(categoryId);
        if (!category) {
            throw createHttpError(404, 'Category not found');
        }
        return category;
    },

    filter: async (
        page?: string,
        limit?: string,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc',
        title?: string
    ) => {
        const allowedSortFields = ['createdAt', 'updatedAt', 'title'];
        const sortField = allowedSortFields.includes(sortBy || '') ? sortBy : 'createdAt';
        const sortDirection = sortOrder === 'asc' ? 1 : -1;

        const filter: Record<string, any> = {};
        if (title && title.trim()) {
            filter.title = { $regex: title.trim(), $options: 'i' };
        }

        const pageNum = Number(page) > 0 ? Number(page) : 1;
        const limitNum = Number(limit) > 0 ? Number(limit) : 10;

        const aggregate = CategoryModel.aggregate([
            { $match: filter },
            { $sort: { [sortField as string]: sortDirection } }
        ]);

        const options = {
            page: pageNum,
            limit: limitNum
        };

        const result = await (CategoryModel as any).aggregatePaginate(aggregate, options);

        return result;
    },

    create: async (categoryData: ICategory) => {
        const { title, image = '', description = '', parentId } = categoryData;

        if (!title?.trim()) {
            throw createHttpError(400, 'Title field is required');
        }

        if (parentId !== undefined && parentId !== null) {
            if (!Types.ObjectId.isValid(parentId))
                throw createHttpError(400, 'Invalid parentId');
            const parent = await CategoryModel.findById(parentId);
            if (!parent || parent.parentId)
                throw createHttpError(404, 'Parent category not found');
        }

        const duplicate = await CategoryModel.findOne({ title });
        if (duplicate) {
            throw createHttpError(409, 'Category title already exists');
        }

        const newCategory = await CategoryModel.create({
            title,
            image,
            description,
            parentId: parentId ?? null
        });
        return newCategory;
    },

    update: async (categoryId: string, categoryData: ICategory) => {
        if (!Types.ObjectId.isValid(categoryId)) {
            throw createHttpError(400, 'Invalid category id');
        }

        const { title, image, description, status, parentId } = categoryData;

        const category = await CategoryModel.findById(categoryId);
        if (!category) {
            throw createHttpError(404, 'Category not found');
        }

        if (title && title !== category.title) {
            const duplicate = await CategoryModel.findOne({ title });
            if (duplicate) {
                throw createHttpError(409, 'Category title already exists');
            }
        }

        if (parentId !== undefined && parentId !== null) {
            if (!Types.ObjectId.isValid(parentId))
                throw createHttpError(400, 'Invalid parentId');
            if (parentId.equals(categoryId))
                throw createHttpError(400, 'Category cannot be its own parent');
            if (parentId !== null) {
                const parent = await CategoryModel.findById(parentId);
                if (!parent || parent.parentId)
                    throw createHttpError(404, 'Parent category not found');
            }
            category.parentId = parentId;
        }

        if (title !== undefined && title.trim()) category.title = title;
        if (image !== undefined) category.image = image;
        if (description !== undefined && description.trim()) category.description = description;
        if (status !== undefined && (status === 'active' || status === 'inactive')) {
            category.status = status;
        }

        const updatedCategory = await CategoryModel.findByIdAndUpdate(
            categoryId,
            category,
            { new: true }
        );
        if (!updatedCategory) {
            throw createHttpError(404, 'Category not found');
        }
        return updatedCategory;
    },

    delete: async (categoryId: string) => {
        if (!Types.ObjectId.isValid(categoryId)) {
            throw createHttpError(400, 'Invalid category id');
        }
        const deletedCategory = await CategoryModel.findByIdAndDelete(categoryId);
        if (!deletedCategory) {
            throw createHttpError(404, 'Category not found');
        }
        return deletedCategory;
    },

    parents: async () => {
        const parents = await CategoryModel.find({ parentId: null });
        if (!parents || parents.length === 0) {
            throw createHttpError(404, 'No parent categories found');
        }
        return parents;
    },

    children: async (parentId: string) => {
        if (!Types.ObjectId.isValid(parentId)) {
            throw createHttpError(400, 'Invalid parent category id');
        }
        const children = await CategoryModel.find({ parentId });
        if (!children || children.length === 0) {
            throw createHttpError(404, 'No child categories found');
        }
        return children;
    }
};
