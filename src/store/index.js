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
import reportsReducer from "@/features/reports/reportsSlice"
import alertsReducer from "@/features/alerts/alertsSlice"
import inventoryReducer from "@/features/inventory/inventorySlice"
import categoriesReducer from "@/features/categories/categoriesSlice"
import productsReducer from "@/features/products/productsSlice"
import warehousesReducer from "@/features/warehouses/warehousesSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoriesReducer,
    products: productsReducer,
    warehouses: warehousesReducer,
    settings: settingsReducer,
    inventory: inventoryReducer,
    alerts: alertsReducer,
    reports: reportsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;