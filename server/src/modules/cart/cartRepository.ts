import CartModel, { ICart, ICartItem } from './cartModel';
import { FilterQuery, Types } from 'mongoose';

export const cartRepository = {
  findByUserId: async (userId: string | Types.ObjectId) => {
    return await CartModel.findOne({ userId });
  },

  findByUserIdWithPopulation: async (userId: string | Types.ObjectId) => {
    return await CartModel.findOne({ userId })
      .populate({
        path: 'items.variantId',
        select: 'variantCode title salePrice listPrice image product',
        populate: {
          path: 'product',
          select: 'title skuCode thumbnailImage -variants'
        }
      })
      .lean();
  },

  create: async (cartData: Partial<ICart>) => {
    return await CartModel.create(cartData);
  },

  findByIdAndUpdate: async (
    cartId: string | Types.ObjectId,
    updateData: Partial<ICart>
  ) => {
    return await CartModel.findByIdAndUpdate(cartId, updateData, {
      new: true
    });
  },

  findByUserIdAndUpdate: async (
    userId: string | Types.ObjectId,
    updateData: Partial<ICart>
  ) => {
    return await CartModel.findOneAndUpdate({ userId }, updateData, {
      new: true,
      upsert: true
    });
  },

  findByIdAndDelete: async (cartId: string | Types.ObjectId) => {
    return await CartModel.findByIdAndDelete(cartId);
  },

  countDocuments: async (filter: FilterQuery<ICart> = {}) => {
    return await CartModel.countDocuments(filter);
  },

  addItemToCart: async (userId: string | Types.ObjectId, item: ICartItem) => {
    return await CartModel.findOneAndUpdate(
      { userId },
      { $push: { items: item } },
      { new: true, upsert: true }
    );
  },

  updateCartItem: async (
    userId: string | Types.ObjectId,
    variantId: string | Types.ObjectId,
    quantity: number
  ) => {
    return await CartModel.findOneAndUpdate(
      { userId, 'items.variantId': variantId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );
  },

  removeItemFromCart: async (
    userId: string | Types.ObjectId,
    variantId: string | Types.ObjectId
  ) => {
    return await CartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { variantId } } },
      { new: true }
    );
  },

  clearCart: async (userId: string | Types.ObjectId) => {
    return await CartModel.findOneAndUpdate(
      { userId },
      { $set: { items: [], totalQuantity: 0, totalPrice: 0 } },
      { new: true, upsert: true }
    );
  }
};
