import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    settings: {
        theme: 'light',
        locale: 'en',
    },
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        updateSettings: (state, action) => {
            state.settings = { ...state.settings, ...action.payload };
        },
        toggleTheme: (state) => {
            state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light';
        },
        setLocale: (state, action) => {
            state.settings.locale = action.payload;
        }
    },
});

export const { updateSettings, toggleTheme, setLocale } = settingsSlice.actions;

// Mock Thunk
export const initializeSettings = () => ({ type: 'settings/initialize' });

// Selectors
export const selectTheme = (state) => state.settings ? state.settings.settings.theme : 'light';
export const selectLocale = (state) => state.settings ? state.settings.settings.locale : 'en';

export default settingsSlice.reducer;
