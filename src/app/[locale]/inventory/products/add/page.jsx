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
import StepMoreInfo from "@/components/inventory/products/ProductFormSteps/StepMoreInfo"; // Attributes
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

  // Build back URL dynamically (works in any locale or nested route)
  const backUrl = pathname?.replace(/\/add\/?$/, "") || "/inventory/products";

  // Success → navigate using <Link> (prefetched + instant)
  const handleSuccess = () => {
    toast.success("Product created successfully!");
    // We trigger navigation via a hidden Link click (best practice for instant prefetch)
    document.getElementById("success-nav-link")?.click();
  };

  const handleSubmit = async () => {
    // Validation logic
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

      const basePrice =
        formData.pricing?.basePrice !== undefined && formData.pricing?.basePrice !== ""
          ? Number(formData.pricing.basePrice)
          : 0;

      const costPrice =
        formData.pricing?.cost !== undefined && formData.pricing?.cost !== ""
          ? Number(formData.pricing.cost)
          : 0;

      const salePrice =
        formData.pricing?.salePrice !== undefined && formData.pricing?.salePrice !== ""
          ? Number(formData.pricing.salePrice)
          : undefined;

      const listPrice =
        formData.pricing?.listPrice !== undefined && formData.pricing?.listPrice !== ""
          ? Number(formData.pricing.listPrice)
          : undefined;

      const normalizedStock = formData.inventory?.quantity !== undefined && formData.inventory?.quantity !== "" ? Number(formData.inventory.quantity) : 0;

      const fullProductData = {
        companyId: "COMPANY_123", // Placeholder
        shopId: "SHOP_1", // Placeholder

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

      // Auto-generate SKU if missing (Simple Mode convenience) - Optional but good
      if (!fullProductData.sku) {
        const brandPart = (fullProductData.brand || 'GEN').slice(0, 3).toUpperCase();
        const namePart = (fullProductData.name || 'PROD').slice(0, 3).toUpperCase();
        const random = Math.floor(Math.random() * 10000);
        fullProductData.sku = `${brandPart}-${namePart}-${random}`;
      }

      await dispatch(createProduct(fullProductData)).unwrap();

      handleSuccess(); // This triggers instant navigation via <Link>
    } catch (error) {
      console.error("Creation failed:", error);
      toast.error(error?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* Back Button + Title */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={backUrl}
              prefetch={true}
              className="flex items-center gap-2 text-gray-600 hover:text-[#FB923C] transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Products</span>
            </Link>
          </div>

          <button
            onClick={() => setIsSimpleMode(!isSimpleMode)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition"
          >
            {isSimpleMode ? (
              <>
                <Layers size={18} /> Switch to Advanced Mode
              </>
            ) : (
              <>
                <Sparkles size={18} /> Switch to Simple Mode
              </>
            )}
          </button>
        </div>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#081422] mb-2">Add New Product</h1>
          <p className="text-gray-500">
            {isSimpleMode
              ? "Quickly add a product with essential details. Switch to Advanced Mode for more options."
              : "Configure all product details including SEO, variants, and advanced inventory settings."}
          </p>
        </div>

        {/* Mobile Steps (Only Advanced) */}
        {!isSimpleMode && (
          <div className="lg:hidden mb-10">
            <div className="flex items-center justify-center gap-6">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${currentStep >= step.id
                      ? "bg-[#FB923C] text-white"
                      : "bg-gray-200 text-gray-500"
                      }`}
                  >
                    {currentStep > step.id ? <Check size={16} /> : step.id}
                  </div>
                  <p className="text-xs text-[#333]">{step.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-12 items-start">
          {/* Form */}
          <div className="flex-1">
            <div className={`border-2 border-[#d1d5db] rounded-3xl p-8 bg-white ${isSimpleMode ? 'shadow-lg border-orange-100' : ''}`}>
              {!isSimpleMode && (
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-[#081422]">
                    {steps[currentStep - 1].title}
                  </h2>
                  <p className="text-[#6b7280] mt-2">
                    Step {currentStep} of {steps.length}
                  </p>
                </div>
              )}

              <div className="space-y-6 h-full">
                {isSimpleMode ? (
                  <div className="h-[500px]"> {/* Fixed height container for slides in page view */}
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
                  </div>
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

              {/* Navigation */}
              <div className="flex justify-between mt-10">
                {!isSimpleMode ? (
                  <>
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 1}
                      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${currentStep === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-2 border-gray-300 text-[#081422] hover:border-[#FB923C]"
                        }`}
                    >
                      <ChevronLeft size={20} />
                      Previous
                    </button>

                    {currentStep === 6 ? (
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-[#FB923C] text-white rounded-2xl hover:bg-[#f97316] disabled:opacity-60 transition font-semibold"
                      >
                        <Check size={20} />
                        {isSubmitting ? "Saving..." : "Save Product"}
                      </button>
                    ) : (
                      <button
                        onClick={nextStep}
                        className="flex items-center gap-2 px-8 py-3 bg-[#FB923C] text-white rounded-2xl hover:bg-[#f97316] transition font-semibold"
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
                      className="flex items-center gap-2 px-10 py-4 bg-[#FB923C] text-white rounded-2xl hover:bg-[#f97316] disabled:opacity-60 transition font-bold text-lg shadow-lg"
                    >
                      <Check size={24} />
                      {isSubmitting ? "Creating..." : "Create Product"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Sidebar (Only Advanced) */}
          {!isSimpleMode && (
            <div className="hidden lg:block w-72">
              <div className="relative">
                <div
                  className="absolute left-6 top-0 w-1 bg-gradient-to-b from-[#FB923C] to-gray-300 transition-all duration-500"
                  style={{ height: `${(currentStep / steps.length) * 100}%` }}
                />
                <div className="space-y-8 relative z-10">
                  {steps.map((step) => (
                    <div key={step.id} className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold transition-all shrink-0 ${step.id < currentStep
                          ? "bg-[#FB923C] text-white"
                          : step.id === currentStep
                            ? "bg-[#FB923C] text-white ring-4 ring-orange-100"
                            : "border-2 border-gray-300 text-gray-500 bg-white"
                          }`}
                      >
                        {step.id < currentStep ? <Check size={24} /> : step.id}
                      </div>
                      <div className="pt-2">
                        <p className={`font-semibold text-sm ${step.id <= currentStep ? "text-[#081422]" : "text-gray-500"}`}>
                          {step.title}
                        </p>
                        <p className="text-xs text-gray-500">Step {step.id} of 6</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
    </div>
  );
}