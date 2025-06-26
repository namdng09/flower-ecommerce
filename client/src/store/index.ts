import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import productDetailReducer from './slices/productDetailSlice';
import categoryReducer from './slices/categorySlice';
export const store = configureStore({
  reducer: {
    products: productReducer,
    productDetail: productDetailReducer,
    categories: categoryReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
