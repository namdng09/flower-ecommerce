import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import productDetailReducer from './slices/productDetailSlice';
import variantReducer from './slices/variantSlice';

import categoryReducer from './slices/categorySlice';
import cartReducer from './slices/cartSlice';
export const store = configureStore({
  reducer: {
    products: productReducer,
    productDetail: productDetailReducer,
    variants: variantReducer,
    categories: categoryReducer,
    carts: cartReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
