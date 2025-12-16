import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from '@/features/documents/documentsSlice';
import productsReducer from '@/features/products/productsSlice';
import billingReducer from "../features/billing/billingSlice";


export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    products: productsReducer,
    billing: billingReducer,
  },
});


export default store;
