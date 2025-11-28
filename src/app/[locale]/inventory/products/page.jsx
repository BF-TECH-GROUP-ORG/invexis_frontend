
"use client";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/store";
import ProductList from "@/components/inventory/products/ProductList";

export default function InventoryStockPage() {
  return (
    <Provider store={store}>
      {/* Toaster – matches your orange/white theme */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#fff",
            color: "#1F1F1F",
            border: "1px solid #E5E5E5",
            borderRadius: "12px",
            boxShadow: "none",           // no shadow
            padding: "15px 18px",
          },
          success: {
            iconTheme: {
              primary: "#16f974ff",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      
      <div className="min-h-screen bg-white">
        {/* Optional top padding so content doesn’t touch the edge */}
        <div className="pt-8">
          <ProductList />
        </div>
      </div>
    </Provider>
  );
}