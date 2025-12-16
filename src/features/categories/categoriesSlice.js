import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };

const categoriesSlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        toggleCategoryActive: () => { },
    },
});

export const { toggleCategoryActive } = categoriesSlice.actions;

export const fetchCategories = () => ({ type: 'categories/fetch' });
export const createCategory = () => ({ type: 'categories/create' });
export const updateCategory = () => ({ type: 'categories/update' });
export const deleteCategory = () => ({ type: 'categories/delete' });

export default categoriesSlice.reducer;
