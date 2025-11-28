"use client";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/store";
import CategoryList from "@/components/inventory/categories/CategoryList";

;

export default function InventoryProductsPage() {
  return (
    <Provider store={store}>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
          },
          success: {
            iconTheme: {
              primary: '#f97316',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="min-h-screen bg-gray-50">
        <CategoryList />
      </div>
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            
            
          </div>
    </Provider>
  );
}