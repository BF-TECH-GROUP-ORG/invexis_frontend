import { createSlice } from "@reduxjs/toolkit";

const onboardingSlice = createSlice({
    name: "onboarding",
    initialState: {
        completed: false,
        activeStep: 0,
    },
    reducers: {
        completeOnboarding: (state) => {
            state.completed = true;
            localStorage.setItem("onboardingCompleted", "true");
        },
        loadOnboarding: (state) => {
            const savedCompleted = localStorage.getItem("onboardingCompleted");
            const savedStep = localStorage.getItem("onboardingActiveStep");

            state.completed = savedCompleted === "true";
            state.activeStep = savedStep ? parseInt(savedStep, 10) : 0;
        },
        setActiveStep: (state, action) => {
            state.activeStep = action.payload;
            localStorage.setItem("onboardingActiveStep", action.payload.toString());
        },
        resetOnboarding: (state) => {
            state.completed = false;
            state.activeStep = 0;
            localStorage.removeItem("onboardingCompleted");
            localStorage.removeItem("onboardingActiveStep");
        }
    }
});


export const { completeOnboarding, loadOnboarding, setActiveStep, resetOnboarding } = onboardingSlice.actions;


export default onboardingSlice.reducer;