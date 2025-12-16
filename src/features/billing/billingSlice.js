import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };

const billingSlice = createSlice({
    name: 'billing',
    initialState,
    reducers: {},
});

export const { } = billingSlice.actions;

export const fetchInvoices = () => ({ type: 'billing/fetchInvoices' });

export default billingSlice.reducer;
