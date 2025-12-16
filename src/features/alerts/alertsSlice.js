import { createSlice } from '@reduxjs/toolkit';

const initialState = { items: [] };

const alertsSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {},
});

export const { } = alertsSlice.actions;

export const fetchAlerts = () => ({ type: 'alerts/fetch' });
export const resolveAlert = () => ({ type: 'alerts/resolve' });
export const deleteAlert = () => ({ type: 'alerts/delete' });

export default alertsSlice.reducer;
