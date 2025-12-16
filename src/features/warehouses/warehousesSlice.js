import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };

const warehousesSlice = createSlice({
    name: 'warehouses',
    initialState,
    reducers: {},
});

export const { } = warehousesSlice.actions;

export const fetchWarehouses = () => ({ type: 'warehouses/fetch' });
export const createWarehouse = () => ({ type: 'warehouses/create' });

export default warehousesSlice.reducer;
