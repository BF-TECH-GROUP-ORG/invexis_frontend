// src/components/inventory/products/AddProductModal.jsx
"use client";

import { X, ChevronRight, ChevronLeft, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import ProgressSteps from "./ProductFormComponents/ProgressSteps";
import StepBasicInfo from "./ProductFormSteps/StepBasicInfo";
import StepInventory from "./ProductFormSteps/StepInventory";
import StepMedia from "./ProductFormSteps/StepMedia";
import StepVariations from "./ProductFormSteps/StepVariations";
import StepAdvanced from "./ProductFormSteps/StepAdvanced";
import useProductForm from "./ProductFormHooks/useProductForm";

const TOTAL_STEPS = 5;

export default function AddProductModal({ onClose, editData = null }) {
  const {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    updateNestedField,
    errors,
    loading,
    categories = [],
    warehouses = [],
    isLoadingCategories,
    isLoadingWarehouses,
    handleSubmit,
    validateStep,
    handleImageUpload,
    removeImage,
    setPrimaryImage,
    addTag,
    removeTag,
    tagInput,
    setTagInput
  } = useProductForm(editData, onClose);

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
    } else {
      toast.error("Please fix the errors before continuing");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Global loading state for dropdowns (optional but nice UX)
  const isLoadingDropdowns = isLoadingCategories || isLoadingWarehouses;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {editData ? "Edit Product" : "Add New Product"}
              </h2>
              <p className="text-sm text-white/90 mt-1">
                Step {currentStep} of {TOTAL_STEPS}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Progress Steps */}
          <ProgressSteps currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          {/* Form Content */}
          <div className="overflow-y-auto p-6" style={{ maxHeight: "calc(90vh - 240px)" }}>
            {isLoadingDropdowns && (
              <div className="text-center py-8 text-gray-500">
                Loading categories and warehouses...
              </div>
            )}

            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <StepBasicInfo
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                  categories={categories}
                  isLoadingCategories={isLoadingCategories ?? false}
                />
              )}

              {currentStep === 2 && (
                <StepInventory
                  formData={formData}
                  updateFormData={updateFormData}
                  updateNestedField={updateNestedField}
                  errors={errors}
                  warehouses={warehouses}
                  isLoadingWarehouses={isLoadingWarehouses ?? false}
                />
              )}

              {currentStep === 3 && (
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
                  updateNestedField={updateNestedField}
                />
              )}

              {currentStep === 4 && (
                <StepVariations
                  formData={formData}
                  updateFormData={updateFormData}
                  errors={errors}
                />
              )}

              {currentStep === 5 && (
                <StepAdvanced
                  formData={formData}
                  updateFormData={updateFormData}
                  updateNestedField={updateNestedField}
                  errors={errors}
                  categories={categories}
                  warehouses={warehouses}
                  isLoadingCategories={isLoadingCategories ?? false}
                  isLoadingWarehouses={isLoadingWarehouses ?? false}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Step {currentStep} of {TOTAL_STEPS}
              </span>

              {currentStep < TOTAL_STEPS ? (
                <button
                  onClick={handleNext}
                  disabled={isLoadingDropdowns}
                  className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition shadow-lg"
                >
                  Next Step
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      {editData ? "Update" : "Add"} Product
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}