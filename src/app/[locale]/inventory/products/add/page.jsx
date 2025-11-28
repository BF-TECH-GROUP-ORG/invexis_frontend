// src/app/inventory/products/add/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Only need this now
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, ChevronLeft, Check, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { createProduct } from "@/features/products/productsSlice";
import useProductForm from "@/components/inventory/products/ProductFormHooks/useProductForm";
import StepBasicInfo from "@/components/inventory/products/ProductFormSteps/StepBasicInfo";
import StepInventory from "@/components/inventory/products/ProductFormSteps/StepInventory";
import StepMedia from "@/components/inventory/products/ProductFormSteps/StepMedia";
import StepAdvanced from "@/components/inventory/products/ProductFormSteps/StepAdvanced";
import StepMoreInfo from "@/components/inventory/products/ProductFormSteps/StepMoreInfo";
import { AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, title: "Basic Info" },
  { id: 2, title: "More Info" },
  { id: 3, title: "Inventory" },
  { id: 4, title: "Media" },
  { id: 5, title: "Advanced" },
];

export default function AddProductPage() {
  const dispatch = useDispatch();
  const pathname = usePathname(); // e.g. "/en/inventory/products/add"

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
    if (!validateStep(5)) {
      toast.error("Please fix all errors before saving");
      return;
    }

    // === [Your full product normalization logic stays 100% the same] ===
    // (I've kept it exactly as you had — just moved success navigation)

    try {
      setIsSubmitting(true);

      // ... [ALL your existing normalization, image handling, FormData/JSON logic] ...
      // (No changes needed here — keep everything you already have)

      await dispatch(createProduct(/* your payload or FormData */)).unwrap();

      handleSuccess(); // This triggers instant navigation via <Link>
    } catch (error) {
      // ... [Your excellent error handling stays exactly the same] ...
      // (No changes needed)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        {/* Back Button + Title */}
        <div className="mb-8 flex items-center gap-4">
          <Link
            href={backUrl}
            prefetch={true}
            className="flex items-center gap-2 text-gray-600 hover:text-[#FB923C] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Products</span>
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-[#081422] mb-10">Add New Product</h1>

        {/* Mobile Steps */}
        <div className="lg:hidden mb-10">
          <div className="flex items-center justify-center gap-6">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all ${
                    currentStep >= step.id
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

        <div className="flex gap-12 items-start">
          {/* Form */}
          <div className="flex-1">
            <div className="border-2 border-[#d1d5db] rounded-3xl p-8 bg-white">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-[#081422]">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-[#6b7280] mt-2">
                  Step {currentStep} of {steps.length}
                </p>
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

              {/* Navigation */}
              <div className="flex justify-between mt-10">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${
                    currentStep === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "border-2 border-gray-300 text-[#081422] hover:border-[#FB923C]"
                  }`}
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                {currentStep === 5 ? (
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
              </div>
            </div>
          </div>

          {/* Desktop Sidebar */}
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
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-semibold transition-all shrink-0 ${
                        step.id < currentStep
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
                      <p className="text-xs text-gray-500">Step {step.id} of 5</p>
                    </div>
                  </div>
                ))}
              </div>
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
    </div>
  );
}