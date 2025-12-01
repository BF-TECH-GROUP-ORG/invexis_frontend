// src/app/inventory/products/add/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, ChevronLeft, Check, ArrowLeft, Sparkles, Layers } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { createProduct } from "@/features/products/productsSlice";
import useProductForm from "@/components/inventory/products/ProductFormHooks/useProductForm";
import StepBasicInfo from "@/components/inventory/products/ProductFormSteps/StepBasicInfo";
import StepInventory from "@/components/inventory/products/ProductFormSteps/StepInventory";
import StepMedia from "@/components/inventory/products/ProductFormSteps/StepMedia";
import StepAdvanced from "@/components/inventory/products/ProductFormSteps/StepAdvanced";
import StepMoreInfo from "@/components/inventory/products/ProductFormSteps/StepMoreInfo";
import StepVariations from "@/components/inventory/products/ProductFormSteps/StepVariations";
import SimpleProductForm from "@/components/inventory/products/SimpleProductForm";
import { AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "Attributes" },
  { id: 3, title: "Inventory" },
  { id: 4, title: "Media" },
  { id: 5, title: "Variations" },
  { id: 6, title: "Advanced" },
];

export default function AddProductPage() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [isSimpleMode, setIsSimpleMode] = useState(true);

  const { items: categories = [] } = useSelector((state) => state.categories || { items: [] });
  const { items: warehouses = [] } = useSelector((state) => state.warehouses || { items: [] });

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
  } = useProductForm();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const backUrl = pathname?.replace(/\/add\/?$/, "") || "/inventory/products";

  const handleSuccess = () => {
    toast.success("Product created successfully!");
    document.getElementById("success-nav-link")?.click();
  };

  const handleSubmit = async () => {
    if (isSimpleMode) {
      const simpleErrors = {};
      if (!formData.name) simpleErrors.name = "Name is required";
      if (!formData.category) simpleErrors.category = "Category is required";
      if (!formData.pricing?.basePrice) simpleErrors.price = "Base Price is required";
      if (formData.inventory?.quantity === undefined || formData.inventory?.quantity === "") simpleErrors.stock = "Stock is required";

      if (Object.keys(simpleErrors).length > 0) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else {
      if (!validateStep(6)) {
        toast.error("Please fix all errors before saving");
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const basePrice = formData.pricing?.basePrice !== undefined && formData.pricing?.basePrice !== "" ? Number(formData.pricing.basePrice) : 0;
      const costPrice = formData.pricing?.cost !== undefined && formData.pricing?.cost !== "" ? Number(formData.pricing.cost) : 0;
      const salePrice = formData.pricing?.salePrice !== undefined && formData.pricing?.salePrice !== "" ? Number(formData.pricing.salePrice) : undefined;
      const listPrice = formData.pricing?.listPrice !== undefined && formData.pricing?.listPrice !== "" ? Number(formData.pricing.listPrice) : undefined;
      const normalizedStock = formData.inventory?.quantity !== undefined && formData.inventory?.quantity !== "" ? Number(formData.inventory.quantity) : 0;

      const fullProductData = {
        companyId: "02451e1b-9cc8-480a-ae22-bd247c54ad71",
        shopId: "SHOP_1",
        name: (formData.name || "").trim(),
        description: {
          short: formData.description?.short || "",
          long: formData.description?.long || ""
        },
        brand: formData.brand || "",
        manufacturer: formData.manufacturer || "",
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        category: formData.category || undefined,
        pricing: {
          basePrice: basePrice,
          salePrice: salePrice,
          listPrice: listPrice,
          cost: costPrice,
          currency: formData.pricing?.currency || "USD",
        },
        inventory: {
          trackQuantity: formData.inventory?.trackQuantity !== undefined ? !!formData.inventory.trackQuantity : true,
          quantity: normalizedStock,
          lowStockThreshold: Number(formData.inventory?.lowStockThreshold || 10),
          allowBackorder: !!formData.inventory?.allowBackorder
        },
        condition: formData.condition || "new",
        availability: formData.availability || "in_stock",
        attributes: Array.isArray(formData.attributes) ? formData.attributes : [],
        images: Array.isArray(formData.images) ? formData.images.map((img, index) => ({
          url: img.url,
          alt: img.alt || "product image",
          isPrimary: !!img.isPrimary,
          sortOrder: index + 1
        })) : [],
        videoUrls: Array.isArray(formData.videoUrls) ? formData.videoUrls.filter(Boolean) : [],
        status: formData.status || "active",
        visibility: formData.visibility || "public",
        featured: !!formData.featured,
        isActive: formData.isActive !== undefined ? !!formData.isActive : true,
        sortOrder: Number(formData.sortOrder || 0),
        seo: formData.seo || {},
        variants: formData.variants || [],
        variations: formData.variations || [],
      };

      if (!fullProductData.sku) {
        const brandPart = (fullProductData.brand || 'GEN').slice(0, 3).toUpperCase();
        const namePart = (fullProductData.name || 'PROD').slice(0, 3).toUpperCase();
        const random = Math.floor(Math.random() * 10000);
        fullProductData.sku = `${brandPart}-${namePart}-${random}`;
      }

      await dispatch(createProduct(fullProductData)).unwrap();
      handleSuccess();
    } catch (error) {
      console.error("Creation failed:", error);
      toast.error(error?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <Toaster position="top-right" />

      {/* Header - Fixed */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Link
              href={backUrl}
              prefetch={true}
              className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg font-medium"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Back to Products</span>
            </Link>

            <button
              onClick={() => setIsSimpleMode(!isSimpleMode)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-orange-500 hover:bg-orange-50 rounded-lg text-orange-600 font-medium transition-all"
            >
              {isSimpleMode ? (
                <>
                  <Layers size={16} />
                  <span className="text-sm">Advanced Mode</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span className="text-sm">Simple Mode</span>
                </>
              )}
            </button>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-xs text-gray-600 mt-1">
              {isSimpleMode
                ? "Quickly add a product with essential details. Switch to Advanced Mode for more options."
                : "Configure all product details including SEO, variants, and advanced inventory settings."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full px-6 py-6">
          <div className="flex gap-6 h-full">
            {/* Form Section */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6">
                  {!isSimpleMode && (
                    <div className="mb-6 pb-4 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-900">
                        {steps[currentStep - 1].title}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">
                        Step {currentStep} of {steps.length}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {isSimpleMode ? (
                      <SimpleProductForm
                        formData={formData}
                        updateFormData={updateFormData}
                        updateNestedField={updateNestedField}
                        errors={errors}
                        categories={categories}
                        warehouses={warehouses}
                        handleImageUpload={handleImageUpload}
                        removeImage={removeImage}
                        setPrimaryImage={setPrimaryImage}
                        addTag={addTag}
                        removeTag={removeTag}
                        tagInput={tagInput}
                        setTagInput={setTagInput}
                      />
                    ) : (
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
                            updateFormData={updateFormData}
                          />
                        )}
                        {currentStep === 5 && (
                          <StepVariations formData={formData} updateFormData={updateFormData} errors={errors} />
                        )}
                        {currentStep === 6 && (
                          <StepAdvanced formData={formData} updateFormData={updateFormData} updateNestedField={updateNestedField} errors={errors} />
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation Buttons - Fixed at bottom */}
              <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 bg-white flex-shrink-0">
                {!isSimpleMode ? (
                  <>
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${currentStep === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border-2 border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600"
                        }`}
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>

                    {currentStep === 6 ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 transition font-semibold shadow-md"
                      >
                        <Check size={20} />
                        {isSubmitting ? "Saving..." : "Save Product"}
                      </button>
                    ) : (
                      <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-semibold shadow-md"
                      >
                        Next
                        <ChevronRight size={20} />
                      </button>
                    )}
                  </>
                ) : (
                  <div className="w-full flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-60 transition font-bold text-lg shadow-lg"
                    >
                      <Check size={24} />
                      {isSubmitting ? "Creating..." : "Create Product"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Steps Progress (Only Advanced) */}
            {!isSimpleMode && (
              <div className="w-64 flex-shrink-0">
                <div className="sticky top-0 bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-fit">
                  <h3 className="text-sm font-semibold text-gray-900 mb-6">Progress</h3>
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
                    <div
                      className="absolute left-6 top-0 w-0.5 bg-orange-500 transition-all duration-500"
                      style={{ height: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />

                    {/* Steps */}
                    <div className="space-y-6 relative z-10">
                      {steps.map((step) => (
                        <div key={step.id} className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all shrink-0 ${step.id < currentStep
                              ? "bg-orange-500 text-white shadow-md"
                              : step.id === currentStep
                                ? "bg-orange-500 text-white ring-4 ring-orange-100 shadow-lg"
                                : "border-2 border-gray-300 text-gray-400 bg-white"
                              }`}
                          >
                            {step.id < currentStep ? <Check size={20} /> : step.id}
                          </div>
                          <div className="pt-2">
                            <p className={`font-semibold text-sm ${step.id <= currentStep ? "text-gray-900" : "text-gray-400"}`}>
                              {step.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">Step {step.id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Link for instant navigation after success */}
      <Link
        id="success-nav-link"
        href={backUrl}
        prefetch={true}
        className="hidden"
      >
        Back to list
      </Link>
    </div>
  );
}