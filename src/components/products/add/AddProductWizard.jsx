"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast"; // Keep for other components if needed, or remove if fully replacing
import { useSession } from "next-auth/react";
import { notificationBus } from "@/lib/notificationBus";
import StepIndicator from "./shared/StepIndicator";
import StepNavigation from "./shared/StepNavigation";
import StepShop from "./steps/StepShop";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Media from "./steps/Step2Media";
import Step3Pricing from "./steps/Step3Pricing";
import Step4Inventory from "./steps/Step4Inventory";
import Step5Category from "./steps/Step5Category";
import Step6Specs from "./steps/Step6Specs";
import StepVariations from "@/components/inventory/products/ProductFormSteps/StepVariations";
import Step7SEO from "./steps/Step7SEO";
import ProductReview from "./review/ProductReview";
import SuccessModal from "./shared/SuccessModal";
import { Loader2, ArrowLeft } from "lucide-react";

// Key for localStorage persistence
const PERSISTENCE_KEY = "invexis_add_product_wizard_state";

export default function AddProductWizard({
  companyId,
  shopId: propShopId,
  initialData = null,
  isEdit = false,
}) {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Determine if user is worker or admin
  const isWorker = session?.user?.role === "worker";

  // Initialize form data
  const [formData, setFormData] = useState({
    // Step Shop (Conditionally set)
    companyId: companyId || "",
    shopId: propShopId || "",
    shopName: "",

    // Step 1: Basic Info
    name: "",
    description: "",
    brand: "",
    manufacturer: "",
    tags: [],
    supplierName: "",
    sortOrder: 1,

    // Step 2: Media
    images: [],
    videoUrls: [],

    // Step 3: Pricing
    pricing: {
      basePrice: 0,
      salePrice: null,
      listPrice: 0,
      cost: 0,
      currency: "RWF",
      priceTiers: [],
    },

    // Step 4: Inventory
    inventory: {
      trackQuantity: true,
      stockQty: 0,
      lowStockThreshold: 10,
      minReorderQty: 5,
      allowBackorder: true,
      safetyStock: 0,
    },
    identifiers: {
      sku: "",
      barcode: "",
      scanId: "",
      asin: "",
      upc: "",
    },

    // Step 5: Category
    category: {
      id: "",
      name: "",
    },
    categoryId: "", // Helper for lookup

    // Step 6: Specs
    specifications: {},
    specsCategory: null,

    // Status & Flags
    condition: "new",
    availability: "in_stock",
    status: "active",
    visibility: "public",
    isFeatured: false,

    // Deprecated structure wrapper for compatibility if needed, but we should use flat ones
    // We'll keep a minimal status object for components that still expect it
    _oldStatus: {
      active: true,
      visible: true,
      availability: "in_stock",
      condition: "new",
      featured: false,
    },
  });

  // Load persisted state on mount (only for new product)
  useEffect(() => {
    if (!isEdit && typeof window !== "undefined") {
      const savedState = localStorage.getItem(PERSISTENCE_KEY);
      if (savedState) {
        try {
          const { formData: savedFormData, currentStep: savedStep } = JSON.parse(savedState);
          if (savedFormData) setFormData(savedFormData);
          if (savedStep) setCurrentStep(savedStep);
          console.log("Welcome back! Restored your progress.");
        } catch (e) {
          console.error("Failed to restore wizard state:", e);
        }
      }
    }
    setIsInitialized(true);
  }, [isEdit]);

  // Persist state on change (only for new product)
  useEffect(() => {
    if (isInitialized && !isEdit && typeof window !== "undefined") {
      const stateToSave = {
        formData,
        currentStep,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(stateToSave));
    }
  }, [formData, currentStep, isEdit, isInitialized]);

  // Effect to handle worker shop assignment or initialData
  useEffect(() => {
    if (initialData) {
      // Handle Specs conversion (Array back to Object for UI)
      let initialSpecs = initialData.specifications || {};
      if (Array.isArray(initialData.specs)) {
        initialSpecs = initialData.specs.reduce((acc, curr) => {
          if (curr.name) acc[curr.name] = curr.value;
          return acc;
        }, {});
      }

      setFormData((prev) => ({
        ...prev,
        ...initialData,
        // Map nested fields if they exist in initialData
        pricing: {
          ...prev.pricing,
          ...(initialData.pricing || {}),
        },
        inventory: {
          ...prev.inventory,
          ...(initialData.inventory || initialData.stock || {}),
          // Handle field renaming from legacy 'stock' if needed
          stockQty:
            initialData.inventory?.stockQty ??
            initialData.stock?.total ??
            prev.inventory.stockQty,
          lowStockThreshold:
            initialData.inventory?.lowStockThreshold ??
            initialData.stock?.lowStockThreshold ??
            prev.inventory.lowStockThreshold,
        },
        identifiers: {
          ...prev.identifiers,
          ...(initialData.identifiers || {}),
        },
        category: initialData.category || {
          id: initialData.categoryId || "",
          name: "",
        },
        specifications: initialSpecs,
        status: initialData.status || prev.status,
        condition:
          initialData.condition ||
          initialData.status?.condition ||
          prev.condition,
        availability:
          initialData.availability ||
          initialData.status?.availability ||
          prev.availability,
        visibility:
          initialData.visibility ||
          (initialData.status?.visible === false ? "hidden" : "public") ||
          prev.visibility,
        isFeatured:
          initialData.isFeatured ??
          initialData.status?.featured ??
          prev.isFeatured,
        // Handle weirdly stringified tags in legacy data
        tags: Array.isArray(initialData.tags)
          ? initialData.tags.flatMap((t) => {
            if (typeof t === "string" && t.startsWith("[")) {
              try {
                return JSON.parse(t);
              } catch (e) {
                return t;
              }
            }
            return t;
          })
          : [],
        // Invert variations/variants mapping for consistency with backend logic
        // Backend 'variations' contains attribute definitions -> formData.variants
        // Backend 'variants' contains generated combinations -> formData.variations
        variants: initialData.variations || prev.variants || [],
        variations: initialData.variants || prev.variations || [],
        media: initialData.media || prev.media,
        images: initialData.media?.images || initialData.images || [],
        videoUrls: (initialData.media?.videos || [])
          .filter((v) => v.type === "url")
          .map((v) => v.url),
      }));
    } else if (
      status === "authenticated" &&
      isWorker &&
      session?.user?.shops?.length > 0
    ) {
      const workerShopId = session.user.shops[0];
      const actualShopId =
        typeof workerShopId === "object" ? workerShopId._id : workerShopId;

      setFormData((prev) => ({
        ...prev,
        shopId: actualShopId,
      }));
    }
  }, [status, isWorker, session, initialData]);

  // Define steps dynamically
  const steps = useMemo(() => {
    const baseSteps = [
      { id: "basic", label: "Basic Info", component: Step1BasicInfo },
      { id: "media", label: "Media", component: Step2Media },
      { id: "pricing", label: "Pricing", component: Step3Pricing },
      { id: "inventory", label: "Inventory", component: Step4Inventory },
      { id: "category", label: "Category", component: Step5Category },
      { id: "specs", label: "Specifications", component: Step6Specs },
      { id: "review", label: "Review & Submit", component: ProductReview },
    ];

    // Filter out hidden steps (variations and seo as requested)
    const hiddenStepIds = ["variations", "seo"];
    const visibleBaseSteps = baseSteps.filter(s => !hiddenStepIds.includes(s.id));

    if (!isWorker) {
      // Admin needs to select shop first
      return [
        { id: "shop", label: "Select Shop", component: StepShop },
        ...visibleBaseSteps,
      ].map((s, idx) => ({ ...s, number: idx + 1 }));
    }

    return visibleBaseSteps.map((s, idx) => ({ ...s, number: idx + 1 }));
  }, [isWorker]);

  const TOTAL_STEPS = steps.length;
  console.log(formData);

  const updateFormData = (updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const getStepStatus = (stepNumber) => {
    const stepObj = steps.find((s) => s.number === stepNumber);
    if (!stepObj) return "complete";

    switch (stepObj.id) {
      case "shop":
        return formData.shopId ? "complete" : "error";
      case "basic":
        return formData.name && formData.name.length >= 3 && formData.supplierName
          ? "complete"
          : "error";
      case "media":
        return formData.images?.length > 0 ? "complete" : "optional";
      case "pricing":
        return formData.pricing.basePrice > 0 ? "complete" : "error";
      case "inventory":
        return formData.inventory.stockQty >= 0 ? "complete" : "error";
      case "category":
        return formData.category?.id ? "complete" : "error";
      case "specs":
        return Object.keys(formData.specifications || {}).length > 0
          ? "complete"
          : "optional";
      default:
        return "complete";
    }
  };

  const areAllRequiredStepsValid = useMemo(() => {
    return steps.every((s) => getStepStatus(s.number) !== "error");
  }, [formData, steps]);

  const handleNext = () => {
    if (getStepStatus(currentStep) === "error") {
      notificationBus.error("Please fill in all required fields in this section.");
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    // Check all required steps for "Add" mode
    if (!isEdit && !areAllRequiredStepsValid) {
      const firstInvalidStep = steps.find((s) => getStepStatus(s.number) === "error");
      notificationBus.error(`Please complete the ${firstInvalidStep.label} section before submitting.`);
      setCurrentStep(firstInvalidStep.number);
      return;
    }

    try {
      setIsSubmitting(true);

      const { createProductApiClient } = await import("@/lib/api/createProductApiClient");

      const response = await createProductApiClient(formData, {
        isEdit,
        productId: initialData?._id
      });

      console.log("🚀 Product Operation Success:", response);

      // Clear persistence on success
      if (typeof window !== "undefined") {
        localStorage.removeItem(PERSISTENCE_KEY);
      }

      setShowSuccessModal(true);
      notificationBus.success(
        isEdit
          ? "Product updated successfully!"
          : "Product created successfully!"
      );
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      notificationBus.error(error.message || "Failed to process product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    // Clear persistence on reset
    if (typeof window !== "undefined") {
      localStorage.removeItem(PERSISTENCE_KEY);
    }

    setShowSuccessModal(false);
    setCurrentStep(1);
    setFormData({
      companyId: companyId || "",
      shopId: propShopId || "",
      shopName: "",
      name: "",
      description: "",
      brand: "",
      manufacturer: "",
      tags: [],
      supplierName: "",
      sortOrder: 1,
      images: [],
      videoUrls: [],
      pricing: {
        basePrice: 0,
        salePrice: null,
        listPrice: 0,
        cost: 0,
        currency: "RWF",
        priceTiers: [],
      },
      inventory: {
        trackQuantity: true,
        stockQty: 0,
        lowStockThreshold: 10,
        minReorderQty: 5,
        allowBackorder: true,
        safetyStock: 0,
      },
      identifiers: {
        sku: "",
        barcode: "",
        scanId: "",
        asin: "",
        upc: "",
      },
      category: {
        id: "",
        name: "",
      },
      categoryId: "",
      specifications: {},
      specsCategory: null,
      condition: "new",
      availability: "in_stock",
      status: "active",
      visibility: "public",
      isFeatured: false,
      _oldStatus: {
        active: true,
        visible: true,
        availability: "in_stock",
        condition: "new",
        featured: false,
      },
    });
  };

  const renderStep = () => {
    if (status === "loading" || !isInitialized) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      );
    }

    // Find current step component
    const stepObj = steps.find((s) => s.number === currentStep);

    // Render Step Component with common props
    if (stepObj) {
      const StepComponent = stepObj.component;
      return (
        <StepComponent
          formData={formData}
          updateFormData={updateFormData}
          steps={steps} // For ProductReview
          onEdit={(stepNumber) => setCurrentStep(stepNumber)} // For ProductReview
          errors={{}} // Pass errors if needed
        />
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1400px] mx-auto pt-6">
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleReset}
        productName={formData.name}
      />

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Main Form Content - Left Side */}
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white rounded-4xl border border-gray-200">
            {/* Header */}
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push(`/${locale}/inventory/products`)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                  title="Back to Products"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? "Edit Product" : "Add New Product"}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {isEdit
                      ? "Update the product details below"
                      : "Fill in the product details step by step"}
                  </p>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6 min-h-[500px]">{renderStep()}</div>

            {/* Navigation */}
            <div className="border-t border-gray-200 p-6">
              <StepNavigation
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                isValid={getStepStatus(currentStep) !== "error"}
                allStepsValid={areAllRequiredStepsValid}
                isSubmitting={isSubmitting}
                isEdit={isEdit}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onBackToList={() => router.push(`/${locale}/inventory/products`)}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>

        {/* Vertical Step Indicator - Right Side */}
        <div className="col-span-12 lg:col-span-3 sticky top-6">
          {status !== "loading" && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Progress</h3>
              <StepIndicator
                currentStep={currentStep}
                steps={steps}
                orientation="vertical"
                onStepClick={(step) => setCurrentStep(step)}
                getStepStatus={getStepStatus}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
