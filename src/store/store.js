import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from '@/Data/dataSlice';
import productsReducer from '@/store/slices/productSlice';

export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    products: productsReducer,
  },
});


export default store;
