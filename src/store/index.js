import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/users/userSlice";
import companyReducer from "../features/companies/companySlice";
import productReducer from "../features/products/productSlice";
import stockReducer from "../features/stock/stockSlice";
import salesReducer from "../features/sales/salesSlice";
import reportReducer from "../features/reports/reportSlice";
import settingsReducer from "@/features/settings/settingsSlice";
import onboardingReducer from "../features/onboarding/onboardingSlice";
import sessionReducer from "../features/session/sessionSlice";

// Listener middleware automatically syncs certain slices to localStorage
const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  predicate: (action, currentState, previousState) => true, // listen to all actions
  effect: (action, listenerApi) => {
    const state = listenerApi.getState();
    localStorage.setItem("auth", JSON.stringify(state.auth));
    localStorage.setItem("session", JSON.stringify(state.session));
  },
});

// Configure the Redux store with all slices
const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    companies: companyReducer,
    products: productReducer,
    stock: stockReducer,
    sales: salesReducer,
    reports: reportReducer,
    settings: settingsReducer,
    onboarding: onboardingReducer,
    session: sessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(listenerMiddleware.middleware),
});

// Client-side rehydration: restore auth and session slices from localStorage
if (typeof window !== "undefined") {
  try {
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      store.dispatch({
        type: "auth/setAuthSession",
        payload: JSON.parse(savedAuth),
      });
    }

    const savedSession = localStorage.getItem("session");
    if (savedSession) {
      store.dispatch({
        type: "session/setSession",
        payload: JSON.parse(savedSession),
      });
    }
  } catch (e) {
    console.error("Failed to rehydrate store:", e);
  }
}

export default store;
