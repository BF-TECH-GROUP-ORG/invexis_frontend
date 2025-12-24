import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import userReducer from "../features/users/userSlice";
import companyReducer from "../features/companies/companySlice";
import stockReducer from "../features/stock/stockSlice";
import salesReducer from "../features/sales/salesSlice";
import reportReducer from "../features/reports/reportSlice";
import settingsReducer from "@/features/settings/settingsSlice";
import onboardingReducer from "../features/onboarding/onboardingSlice";
import sessionReducer from "../features/session/sessionSlice";
import reportsReducer from "@/features/reports/reportsSlice";
import alertsReducer from "@/features/alerts/alertsSlice";
import inventoryReducer from "@/features/inventory/inventorySlice";
import categoriesReducer from "@/features/categories/categoriesSlice";
import productsReducer from "@/features/products/productsSlice";
import warehousesReducer from "@/features/warehouses/warehousesSlice";
// import { configureStore } from '@reduxjs/toolkit';
// import categoriesReducer from '../features/categories/categoriesSlice';
// import productsReducer from '../features/products/productsSlice';
// import warehousesReducer from '../features/warehouses/warehousesSlice';
// import alertsReducer from '../features/alerts/alertsSlice';
// import reportsReducer from '../features/reports/reportsSlice';
// import inventoryReducer from '../features/inventory/inventorySlice';
// import authReducer from '../features/auth/authSlice';
// import settingsReducer from '../features/settings/settingsSlice';
import documentsReducer from '../features/documents/documentsSlice';
import billingReducer from "../features/billing/billingSlice";
import announcementsReducer from "@/features/announcements/announcementsSlice";

import notificationReducer from "@/features/NotificationSlice";
import logsReducer from "@/features/logs/logsSlice";

export const store = configureStore({
  reducer: {
    // auth reducer removed - authentication is managed by NextAuth
    categories: categoriesReducer,
    products: productsReducer,
    warehouses: warehousesReducer,
    settings: settingsReducer,
    inventory: inventoryReducer,
    alerts: alertsReducer,
    reports: reportsReducer,
    documents: documentsReducer,
    billing: billingReducer,
    announcements: announcementsReducer,
    notifications: notificationReducer,
    logs: logsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production",
});

export default store;
