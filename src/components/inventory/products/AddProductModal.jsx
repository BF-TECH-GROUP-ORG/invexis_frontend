"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Plus,
  Sparkles,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import {
  createProduct,
  updateProduct,
} from "@/features/products/productsSlice";
import ProgressSteps from "./ProductFormComponents/ProgressSteps";
import StepBasicInfo from "./ProductFormSteps/StepBasicInfo";
import StepMoreInfo from "./ProductFormSteps/StepMoreInfo";
import StepInventory from "./ProductFormSteps/StepInventory";
import StepMedia from "./ProductFormSteps/StepMedia";
import StepVariations from "./ProductFormSteps/StepVariations";
import StepAdvanced from "./ProductFormSteps/StepAdvanced";
import SimpleProductForm from "./SimpleProductForm";
import useProductForm from "./ProductFormHooks/useProductForm";

const TOTAL_STEPS = 6;

export default function AddProductModal({ onClose, editData = null }) {
  const t = useTranslations("products.form");
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const companyObj = session?.user?.companies?.[0];
  const companyId =
    typeof companyObj === "string"
      ? companyObj
      : companyObj?.id || companyObj?._id;
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
    setTagInput,
  } = useProductForm(editData, onClose);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const loading = formLoading || isSubmitting;

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    } else {
      toast.error(t("modal.errorFix"));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!isSimpleMode && !validateStep(TOTAL_STEPS)) {
      toast.error(t("modal.errorAll"));
      return;
    }

    try {
      setIsSubmitting(true);

      const basePrice =
        formData.pricing?.basePrice !== "" &&
          formData.pricing?.basePrice !== undefined
          ? Number(formData.pricing.basePrice)
          : 0;

      const costPrice =
        formData.pricing?.cost !== "" && formData.pricing?.cost !== undefined
          ? Number(formData.pricing.cost)
          : 0;

      const salePrice =
        formData.pricing?.salePrice !== ""
          ? Number(formData.pricing.salePrice)
          : undefined;

      const listPrice =
        formData.pricing?.listPrice !== ""
          ? Number(formData.pricing.listPrice)
          : undefined;

      const normalizedStock =
        formData.inventory?.quantity !== "" &&
          formData.inventory?.quantity !== undefined
          ? Number(formData.inventory.quantity)
          : 0;

      const payload = {
        companyId: companyId,
        shopId: "SHOP_1",

        name: (formData.name || "").trim(),
        description: {
          short: formData.description?.short || "",
          long: formData.description?.long || "",
        },
        brand: formData.brand || "",
        manufacturer: formData.manufacturer || "",
        tags: Array.isArray(formData.tags) ? formData.tags : [],
        category: formData.category || undefined,

        pricing: {
          basePrice,
          salePrice,
          listPrice,
          cost: costPrice,
          currency: formData.pricing?.currency || "USD",
        },

        inventory: {
          trackQuantity: formData.inventory?.trackQuantity ?? true,
          quantity: normalizedStock,
          lowStockThreshold: Number(
            formData.inventory?.lowStockThreshold || 10
          ),
          allowBackorder: !!formData.inventory?.allowBackorder,
        },

        condition: formData.condition || "new",
        availability: formData.availability || "in_stock",

        attributes: formData.attributes || [],

        images: Array.isArray(formData.images)
          ? formData.images.map((img, index) => ({
            url: img.url,
            alt: img.alt || "product image",
            isPrimary: !!img.isPrimary,
            sortOrder: index + 1,
          }))
          : [],

        videoUrls: formData.videoUrls?.filter(Boolean) || [],

        status: formData.status || "active",
        visibility: formData.visibility || "public",
        featured: !!formData.featured,
        isActive: formData.isActive ?? true,
        sortOrder: Number(formData.sortOrder || 0),

        seo: formData.seo || {},
        variants: formData.variants || [],
        variations: formData.variations || [],
      };

      // Normalize and validate category: ensure we send categoryId and it is level 3
      let selectedCategory = null;
      if (typeof formData.category === "string" && formData.category) {
        selectedCategory =
          categories.find(
            (c) => c._id === formData.category || c.id === formData.category
          ) || null;
      } else if (
        formData.category &&
        (formData.category._id || formData.category.id)
      ) {
        selectedCategory =
          categories.find(
            (c) => c._id === (formData.category._id || formData.category.id)
          ) || formData.category;
      }

      if (!selectedCategory) {
        toast.error(t("modal.errorSelectCategory"));
        setIsSubmitting(false);
        return;
      }

      if (selectedCategory.level !== 3) {
        toast.error(t("modal.errorLevel3"));
        setIsSubmitting(false);
        return;
      }

      const categoryIdToSend =
        selectedCategory._id || selectedCategory.id || selectedCategory;
      payload.categoryId = categoryIdToSend;
      payload.category = {
        id: categoryIdToSend,
        name: selectedCategory.name || "",
      };

      if (editData) {
        await dispatch(
          updateProduct({ id: editData._id || editData.id, data: payload })
        ).unwrap();
        toast.success(t("modal.successUpdate"));
      } else {
        await dispatch(createProduct(payload)).unwrap();
        toast.success(t("modal.successCreate"));
      }

      onClose();
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(error?.message || t("modal.failureSave"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimpleSubmit = () => {
    const simpleErrors = {};
    if (!formData.name) simpleErrors.name = t("errors.nameRequired");
    if (!formData.category) simpleErrors.category = t("errors.categoryRequired");
    if (!formData.pricing?.basePrice)
      simpleErrors.price = t("errors.priceRequired");
    if (
      formData.inventory?.quantity === "" ||
      formData.inventory?.quantity === undefined
    )
      simpleErrors.stock = t("errors.stockRequired");

    if (Object.keys(simpleErrors).length > 0) {
      toast.error(t("modal.requiredFields"));
      return;
    }

    handleSubmit();
  };

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
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {editData ? t("modal.editTitle") : t("modal.createTitle")}
                {isSimpleMode && (
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <Sparkles size={12} /> {t("modal.simple")}
                  </span>
                )}
              </h2>
              <p className="text-sm text-white/90 mt-1">
                {isSimpleMode
                  ? t("modal.quickAdd")
                  : t("modal.advancedPrompt", { step: currentStep, total: TOTAL_STEPS })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSimpleMode(!isSimpleMode)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium border border-white/20"
              >
                {isSimpleMode ? (
                  <>
                    <Layers size={16} /> {t("modal.switchToAdvanced")}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> {t("modal.switchToSimple")}
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

          {!isSimpleMode && (
            <ProgressSteps currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          )}

          {/* Content */}
          <div
            className={`p-6 flex-1 ${isSimpleMode ? "overflow-hidden flex flex-col" : "overflow-y-auto"
              }`}
          >
            {isLoadingDropdowns ? (
              <div className="text-center py-8 text-gray-500">
                {t("modal.loadingCategories")}
              </div>
            ) : (
              <>
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
                        isLoadingCategories={isLoadingCategories}
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
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div>
              {!isSimpleMode && currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  <ChevronLeft size={20} />
                  {t("modal.previous")}
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
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      {t("modal.saving")}
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      {editData ? t("modal.updateProduct") : t("modal.createProduct")}
                    </>
                  )}
                </button>
              ) : currentStep < TOTAL_STEPS ? (
                <button
                  onClick={handleNext}
                  disabled={isLoadingDropdowns}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
                >
                  {t("modal.nextStep")}
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      {t("modal.saving")}
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      {editData ? t("modal.updateProduct") : t("modal.createProduct")}
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
