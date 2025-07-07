import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import productDetailReducer from './slices/productDetailSlice';
import variantReducer from './slices/variantSlice';
import userReducer from './slices/userSlice';

import categoryReducer from './slices/categorySlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import addressReducer from './slices/addressSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    productDetail: productDetailReducer,
    variants: variantReducer,
    users: userReducer,
    categories: categoryReducer,
    carts: cartReducer,
    orders: orderReducer,
    addresses : addressReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
