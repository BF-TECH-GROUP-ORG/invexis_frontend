import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
    stats: {},
    filteredData: [],
};

const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setPage: () => { },
        setPerPage: () => { },
        setSearch: () => { },
    },
});

export const { setPage, setPerPage, setSearch } = documentsSlice.actions;

// Mock Thunks & Selectors
export const createDocument = () => ({ type: 'documents/create' });
export const updateDocument = () => ({ type: 'documents/update' });
export const fetchDocuments = () => ({ type: 'documents/fetch' });
export const selectDocumentStats = (state) => state.documents.stats;
export const selectFilteredData = (state) => state.documents.items;

export default documentsSlice.reducer;
