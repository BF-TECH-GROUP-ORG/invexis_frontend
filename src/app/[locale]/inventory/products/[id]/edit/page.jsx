"use client";

import React, { useEffect, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "@/features/products/productsSlice";
import AddProductWizard from "@/components/products/add/AddProductWizard";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Toaster } from "react-hot-toast";

function EditProductPageContent({ params }) {
  // Unwrap params Promise using React.use()
  const unwrappedParams = React.use(params);
  const { id, locale } = unwrappedParams;
  const router = useRouter();
  const dispatch = useDispatch();

  const product = useSelector((s) => s.products.selectedProduct);
  const loading = useSelector((s) => s.products.loading);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  if (loading && !product) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium tracking-tight">
            Fetching product details...
          </p>
        </div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-xl border border-gray-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ArrowLeft size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            The product you are trying to edit doesn't exist or has been removed
            from the catalog.
          </p>
          <button
            onClick={() => router.push(`/${locale}/inventory/products`)}
            className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-200"
          >
            Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      <AddProductWizard
        companyId={product?.companyId}
        shopId={product?.shopId}
        initialData={product}
        isEdit={true}
      />
    </div>
  );
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><div className="text-gray-500">Loading...</div></div>}>
      <EditProductPageContent />
    </Suspense>
  );
}
