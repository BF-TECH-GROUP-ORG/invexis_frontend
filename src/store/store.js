import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from '@/features/documents/documentsSlice';
import productsReducer from '@/features/products/productsSlice';


export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    products: productsReducer,
  },
});


export default store;
