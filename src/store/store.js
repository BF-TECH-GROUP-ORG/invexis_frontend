import { configureStore } from '@reduxjs/toolkit';
import documentsReducer from '@/Data/dataSlice';


export const store = configureStore({
  reducer: {
    documents: documentsReducer,
    products: productsReducer,
  },
});


export default store;
