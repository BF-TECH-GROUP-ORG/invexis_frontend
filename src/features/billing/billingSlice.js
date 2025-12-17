import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mockInvoices } from './mockBillingData';

// Simulate API call
export const fetchInvoices = createAsyncThunk('billing/fetchInvoices', async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockInvoices);
        }, 800);
    });
});

const billingSlice = createSlice({
    name: 'billing',
    initialState: {
        items: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {
        markAsPaid: (state, action) => {
            const { id, method } = action.payload;
            const invoice = state.items.find(inv => inv.id === id);
            if (invoice) {
                invoice.status = 'Paid';
                invoice.paymentMethod = method;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInvoices.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchInvoices.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload; // Use mock data for now
            })
            .addCase(fetchInvoices.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { markAsPaid } = billingSlice.actions;
export default billingSlice.reducer;
