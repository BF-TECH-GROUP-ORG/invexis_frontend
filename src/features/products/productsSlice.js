import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };

const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {},
});

export const { } = productsSlice.actions;

export const fetchProducts = () => ({ type: 'products/fetch' });
export const createProduct = () => ({ type: 'products/create' });
export const updateProduct = () => ({ type: 'products/update' });
export const deleteProduct = () => ({ type: 'products/delete' });
export const fetchProductById = () => ({ type: 'products/fetchById' });

export default productsSlice.reducer;
