// src/components/inventory/products/AddProductModal.jsx
"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { X, ChevronRight, ChevronLeft, Plus, Sparkles, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { createProduct, updateProduct } from "@/features/products/productsSlice";
import ProgressSteps from "./ProductFormComponents/ProgressSteps";
import StepBasicInfo from "./ProductFormSteps/StepBasicInfo";
import StepMoreInfo from "./ProductFormSteps/StepMoreInfo"; // Attributes Step
import StepInventory from "./ProductFormSteps/StepInventory";
import StepMedia from "./ProductFormSteps/StepMedia";
import StepVariations from "./ProductFormSteps/StepVariations";
import StepAdvanced from "./ProductFormSteps/StepAdvanced";
import SimpleProductForm from "./SimpleProductForm";
import useProductForm from "./ProductFormHooks/useProductForm";

const TOTAL_STEPS = 6;

export default function AddProductModal({ onClose, editData = null }) {
  const dispatch = useDispatch();
  const [isSimpleMode, setIsSimpleMode] = useState(true);

  const {
    currentStep,
    setCurrentStep,
    formData,
    updateFormData,
    updateNestedField,
    errors,
    loading: formLoading,
    categories = [],
    warehouses = [],
    isLoadingCategories,
    isLoadingWarehouses,
    validateStep,
    handleImageUpload,
    removeImage,
    setPrimaryImage,
    addTag,
    removeTag,
    tagInput,
    setTagInput
  } = useProductForm(editData, onClose);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const loading = formLoading || isSubmitting;

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

  const handleSubmit = async () => {
    if (!isSimpleMode && !validateStep(TOTAL_STEPS)) {
      toast.error("Please fix all errors before saving");
      return;
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

      // Construct payload matching user's requested structure
      const payload = {
        companyId: "COMPANY_123", // Placeholder as per request
        shopId: "SHOP_1", // Placeholder as per request

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

      if (editData) {
        await dispatch(updateProduct({ id: editData._id || editData.id, data: payload })).unwrap();
        toast.success("Product updated successfully");
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast.success("Product created successfully");
      }

      onClose();
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(error?.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimpleSubmit = () => {
    // Validate essential fields manually for simple mode
    const simpleErrors = {};
    if (!formData.name) simpleErrors.name = "Name is required";
    if (!formData.category) simpleErrors.category = "Category is required";
    if (!formData.pricing?.basePrice) simpleErrors.price = "Base Price is required";
    if (formData.inventory?.quantity === undefined || formData.inventory?.quantity === "") simpleErrors.stock = "Stock is required";

    if (Object.keys(simpleErrors).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    handleSubmit();
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
          className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {editData ? "Edit Product" : "Add New Product"}
                {isSimpleMode && <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium flex items-center gap-1"><Sparkles size={12} /> Simple</span>}
              </h2>
              <p className="text-sm text-white/90 mt-1">
                {isSimpleMode ? "Quickly add a product with essential details." : `Step ${currentStep} of ${TOTAL_STEPS} - Advanced Configuration`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSimpleMode(!isSimpleMode)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition border border-white/20"
              >
                {isSimpleMode ? (
                  <>
                    <Layers size={16} /> Switch to Advanced
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Switch to Simple
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Progress Steps (Only in Advanced Mode) */}
          {!isSimpleMode && <ProgressSteps currentStep={currentStep} totalSteps={TOTAL_STEPS} />}

          {/* Form Content */}
          <div className={`p-6 flex-1 ${isSimpleMode ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
            {isLoadingDropdowns && (
              <div className="text-center py-8 text-gray-500">
                Loading categories...
              </div>
            )}

            {isSimpleMode ? (
              <SimpleProductForm
                formData={formData}
                updateFormData={updateFormData}
                updateNestedField={updateNestedField}
                errors={errors}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
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
                  <StepBasicInfo
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                    categories={categories}
                    isLoadingCategories={isLoadingCategories ?? false}
                  />
                )}

                {currentStep === 2 && (
                  <StepMoreInfo
                    formData={formData}
                    updateFormData={updateFormData}
                  />
                )}

                {currentStep === 3 && (
                  <StepInventory
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                  />
                )}

                {currentStep === 4 && (
                  <StepMedia
                    formData={formData}
                    handleImageUpload={handleImageUpload}
                    removeImage={removeImage}
                    setPrimaryImage={setPrimaryImage}
                    updateFormData={updateFormData}
                  />
                )}

                {currentStep === 5 && (
                  <StepVariations
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                  />
                )}

                {currentStep === 6 && (
                  <StepAdvanced
                    formData={formData}
                    updateFormData={updateFormData}
                    updateNestedField={updateNestedField}
                    errors={errors}
                  />
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between shrink-0">
            <div>
              {!isSimpleMode && currentStep > 1 && (
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
              {!isSimpleMode && (
                <span className="text-sm text-gray-600 mr-2">
                  Step {currentStep} of {TOTAL_STEPS}
                </span>
              )}

              {isSimpleMode ? (
                <button
                  onClick={handleSimpleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition shadow-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      {editData ? "Update Product" : "Create Product"}
                    </>
                  )}
                </button>
              ) : (
                <>
                  {currentStep < TOTAL_STEPS ? (
                    <button
                      onClick={handleNext}
                      disabled={isLoadingDropdowns}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition shadow-lg"
                    >
                      Next Step
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition shadow-lg"
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
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}