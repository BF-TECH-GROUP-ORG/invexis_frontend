"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { updateProduct, fetchProductById } from "@/features/products/productsSlice";
import useProductForm from "@/components/inventory/products/ProductFormHooks/useProductForm";
import StepBasicInfo from "@/components/inventory/products/ProductFormSteps/StepBasicInfo";
import StepMoreInfo from "@/components/inventory/products/ProductFormSteps/StepMoreInfo";
import StepInventory from "@/components/inventory/products/ProductFormSteps/StepInventory";
import StepMedia from "@/components/inventory/products/ProductFormSteps/StepMedia";
import StepAdvanced from "@/components/inventory/products/ProductFormSteps/StepAdvanced";
import { AnimatePresence } from "framer-motion";

export default function EditProductPage({ params }) {
  // Unwrap params Promise using React.use()
  const unwrappedParams = React.use(params);
  const { id, locale } = unwrappedParams;

  const router = useRouter();
  const dispatch = useDispatch();

  const { items: categories = [] } = useSelector((state) => state.categories || { items: [] });
  const { items: warehouses = [] } = useSelector((state) => state.warehouses || { items: [] });
  const product = useSelector((s) => s.products.selectedProduct);
  const loading = useSelector((s) => s.products.loading);

  const {
    formData,
    errors,
    currentStep,
    updateFormData,
    updateNestedField,
    validateStep,
    handleImageUpload,
    removeImage,
    setPrimaryImage,
    addTag,
    removeTag,
    tagInput,
    setTagInput,
    nextStep,
    prevStep,
    goToStep,
  } = useProductForm(product);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  // The hook will initialize formData when `product` (initialData) is provided.

  const handleSubmit = async () => {
    // final validation for last step
    if (!validateStep(5)) {
      toast.error("Please fix all errors before saving");
      return;
    }

    const basePrice =
      formData.pricing?.basePrice !== undefined && formData.pricing?.basePrice !== ""
        ? Number(formData.pricing.basePrice)
        : formData.price
          ? Number(formData.price)
          : null;

    const costPrice =
      formData.pricing?.cost !== undefined && formData.pricing?.cost !== ""
        ? Number(formData.pricing.cost)
        : formData.costPrice
          ? Number(formData.costPrice)
          : null;

    const normalizedStock = formData.stock !== undefined && formData.stock !== "" ? Number(formData.stock) : null;

    const fullProductData = {
      name: (formData.name || "").trim(),
      sku: formData.sku || undefined,
      category: formData.category || undefined,
      brand: formData.brand || undefined,
      tags: Array.isArray(formData.tags) ? formData.tags : [],

      description: formData.description || undefined,
      specifications: formData.specifications || {},

      stock: normalizedStock,
      minStockLevel: formData.minStockLevel ? Number(formData.minStockLevel) : undefined,
      maxStockLevel: formData.maxStockLevel ? Number(formData.maxStockLevel) : undefined,
      warehouse: formData.warehouse || undefined,
      expiryDate: formData.expiryDate || undefined,

      images: Array.isArray(formData.images) ? formData.images : [],

      pricing: {
        basePrice: basePrice,
        salePrice:
          formData.pricing?.salePrice !== undefined && formData.pricing?.salePrice !== ""
            ? Number(formData.pricing.salePrice)
            : undefined,
        currency: formData.pricing?.currency || "USD",
        cost: costPrice,
      },

      // legacy fields kept for compatibility
      price: basePrice,
      costPrice: costPrice,

      status: formData.status || "active",
      visibility: formData.visibility || "public",
      isTaxable: !!formData.isTaxable,
      trackInventory: !!formData.trackInventory,
      allowBackorder: !!formData.allowBackorder,
      isPerishable: !!formData.isPerishable,
      notes: formData.notes || undefined,
    };

    if (!fullProductData.name) {
      toast.error("Product name is required");
      return;
    }
    if (!fullProductData.category) {
      toast.error("Category is required");
      return;
    }
    if (fullProductData.pricing.basePrice === null || isNaN(fullProductData.pricing.basePrice) || fullProductData.pricing.basePrice <= 0) {
      toast.error("Valid product price is required");
      return;
    }

    const generateSku = (product) => {
      const brand = (product.brand || "").toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      const brandPart = brand ? brand.slice(0, 3) : 'PRD';
      const namePart = (product.name || '').toString().trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'ITEM';
      const ts = Date.now().toString(36).toUpperCase();
      const random = Math.floor(Math.random() * 900 + 100).toString();
      return `${brandPart}-${namePart}-${ts}-${random}`;
    };

    if (!fullProductData.sku) fullProductData.sku = generateSku(fullProductData);

    setIsSubmitting(true);
    try {
      await dispatch(updateProduct({ id, updates: fullProductData })).unwrap();
      toast.success("Product updated successfully");
      // Navigate back to product detail
      router.push(`/${(locale || 'en')}/inventory/products/${id}`);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err?.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-12 items-start">
          <div className="flex-1">
            <div className="border-2 border-[#d1d5db] rounded-3xl p-8 bg-white">
              <div className="mb-8 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-gray-100">
                    <ArrowLeft />
                  </button>
                  <div>
                    <h2 className="text-3xl font-bold text-[#081422]">Edit Product</h2>
                    <p className="text-[#6b7280] mt-2">Modify the product information and save your changes.</p>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => router.push(`/${(params?.locale || 'en')}/inventory/products/${id}`)}
                    className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <AnimatePresence mode="wait">
                  {currentStep === 1 && (
                    <StepBasicInfo formData={formData} updateFormData={updateFormData} errors={errors} categories={categories} />
                  )}
                  {currentStep === 2 && (
                    <StepMoreInfo formData={formData} updateFormData={updateFormData} updateNestedField={updateNestedField} errors={errors} />
                  )}
                  {currentStep === 3 && (
                    <StepInventory formData={formData} updateFormData={updateFormData} updateNestedField={updateNestedField} errors={errors} warehouses={warehouses} />
                  )}
                  {currentStep === 4 && (
                    <StepMedia
                      formData={formData}
                      handleImageUpload={handleImageUpload}
                      removeImage={removeImage}
                      setPrimaryImage={setPrimaryImage}
                      addTag={addTag}
                      removeTag={removeTag}
                      tagInput={tagInput}
                      setTagInput={setTagInput}
                    />
                  )}
                  {currentStep === 5 && (
                    <StepAdvanced formData={formData} updateFormData={updateFormData} updateNestedField={updateNestedField} errors={errors} />
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-between mt-10">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${currentStep === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "border-2 border-gray-300 text-[#081422] hover:border-[#FB923C]"
                    }`}
                >
                  Previous
                </button>

                {currentStep === 5 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-[#FB923C] text-white rounded-2xl hover:bg-[#f97316] disabled:opacity-60 transition font-semibold"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-8 py-3 bg-[#FB923C] text-white rounded-2xl hover:bg-[#f97316] transition font-semibold"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-72">
            <div className="relative">
              <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center font-semibold bg-[#FB923C] text-white">1</div>
                  <div className="pt-2">
                    <p className="font-semibold text-sm">Basic Info</p>
                    <p className="text-xs text-gray-500">Step 1 of 5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
