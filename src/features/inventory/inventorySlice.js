import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };

const inventorySlice = createSlice({
    name: 'inventory',
    initialState,
    reducers: {},
});

export const { } = inventorySlice.actions;
export default inventorySlice.reducer;
