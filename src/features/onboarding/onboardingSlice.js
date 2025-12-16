import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isOnboardingCompleted: false,
    step: 0,
};

const onboardingSlice = createSlice({
    name: 'onboarding',
    initialState,
    reducers: {
        completeOnboarding: (state) => {
            state.isOnboardingCompleted = true;
        },
        setActiveStep: (state, action) => {
            state.step = action.payload;
        },
    },
});

export const { completeOnboarding, setActiveStep } = onboardingSlice.actions;

export const loadOnboarding = () => ({ type: 'onboarding/load' });

// Selectors
export const selectIsOnboardingCompleted = (state) => state.onboarding?.isOnboardingCompleted;
export const selectOnboardingStep = (state) => state.onboarding?.step;

export default onboardingSlice.reducer;
