import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/users/userSlice";
import companyReducer from "../features/companies/companySlice";
import productReducer from "../features/products/productSlice";
import stockReducer from "../features/stock/stockSlice";
import salesReducer from "../features/sales/salesSlice";
import reportReducer from "../features/reports/reportSlice";
import settingsReducer from "../features/settings/settingsSlice";

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
  },
});

export default store;
