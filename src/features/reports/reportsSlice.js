import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };

const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {},
});

export const { } = reportsSlice.actions;

export const fetchInventorySummary = () => ({ type: 'reports/fetchSummary' });
export const fetchInventoryReports = () => ({ type: 'reports/fetchReports' });

export default reportsSlice.reducer;
