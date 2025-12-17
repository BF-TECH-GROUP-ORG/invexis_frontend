"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";
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
import { Loader2 } from "lucide-react";

export default function AddProductWizard({ companyId, shopId: propShopId }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    condition: "new",
    availability: "in_stock",
    visibility: "public",
    isFeatured: false,
    status: "active",

    // Step 2: Media
    images: [],
    videoUrls: [],
    videoFiles: [],

    // Step 3: Pricing
    pricing: {
      basePrice: 0,
      salePrice: null,
      listPrice: 0,
      costPrice: 0,
      currency: "USD",
      priceTiers: [],
    },

    // Step 4: Inventory
    inventory: {
      quantity: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      trackQuantity: true,
      allowBackorder: false,
      sku: "",
      barcode: "",
    },
    supplierName: "",

    // Step 5: Category
    categoryId: "",
    categoryName: "",
    parentCategoryName: "",

    // Step 6: Specs
    specs: {},

    // Step 7: Variations
    variants: [],
    variations: [],

    // Step 8: SEO
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      slug: "",
    },
  });

  // Effect to handle worker shop assignment
  useEffect(() => {
    if (
      status === "authenticated" &&
      isWorker &&
      session?.user?.shops?.length > 0
    ) {
      // Worker has shop assigned in profile
      const workerShopId = session.user.shops[0]; // Assuming first shop
      // If shopId is an object or string, handle accordingly.
      // Based on request, it looks like an array of strings (Ids).
      // If it was populated object, we'd need ._id
      const actualShopId =
        typeof workerShopId === "object" ? workerShopId._id : workerShopId;

      setFormData((prev) => ({
        ...prev,
        shopId: actualShopId,
        // shopName: ... (we might not have name here easily without fetching, but that's ok for worker flow as it's hidden)
      }));
    }
  }, [status, isWorker, session]);

  // Define steps dynamically
  const steps = useMemo(() => {
    const baseSteps = [
      { id: "basic", label: "Basic Info", component: Step1BasicInfo },
      { id: "media", label: "Media", component: Step2Media },
      { id: "pricing", label: "Pricing", component: Step3Pricing },
      { id: "inventory", label: "Inventory", component: Step4Inventory },
      { id: "category", label: "Category", component: Step5Category },
      { id: "specs", label: "Specifications", component: Step6Specs },
      { id: "variations", label: "Variations", component: StepVariations },
      { id: "seo", label: "SEO", component: Step7SEO },
    ];

    if (!isWorker) {
      // Admin needs to select shop first
      return [
        { id: "shop", label: "Select Shop", component: StepShop },
        ...baseSteps,
      ].map((s, idx) => ({ ...s, number: idx + 1 }));
    }

    return baseSteps.map((s, idx) => ({ ...s, number: idx + 1 }));
  }, [isWorker]);

  const TOTAL_STEPS = steps.length;
  console.log(formData);

  const updateFormData = (updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const validateStep = (stepNumber) => {
    const stepObj = steps.find((s) => s.number === stepNumber);
    if (!stepObj) return true;

    switch (stepObj.id) {
      case "shop":
        return !!formData.shopId;
      case "basic":
        return formData.name && formData.name.length >= 3;
      case "media":
        return true;
      case "pricing":
        return formData.pricing.basePrice > 0;
      case "inventory":
        return formData.inventory.quantity >= 0;
      case "category":
        return formData.categoryId !== "";
      case "specs":
        return true;
      case "variations":
        return true;
      case "seo":
        // Optional
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowReview(true);
    }
  };

  const handlePrevious = () => {
    if (showReview) {
      setShowReview(false);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const preparePayload = () => {
    // format images with metadata
    const formattedImages = formData.images.map((img, index) => ({
      url: img.url,
      alt: `${formData.name} - View ${index + 1}`,
      isPrimary: index === 0,
      sortOrder: index + 1,
      file: img.file, // keep file for upload logic
    }));

    // transform specs object to array
    const specsArray = Object.entries(formData.specs).map(([key, value]) => ({
      name: key,
      value: value,
    }));

    return {
      companyId: formData.companyId,
      shopId: formData.shopId,
      categoryId: formData.categoryId,

      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      manufacturer: formData.manufacturer,
      supplierName: formData.supplierName || formData.manufacturer, // fallback
      tags: formData.tags,
      condition: formData.condition,
      availability: formData.availability,
      visibility: formData.visibility,
      isFeatured: formData.isFeatured,
      status: formData.status,
      sortOrder: 0, // default

      pricing: {
        basePrice: formData.pricing.basePrice,
        salePrice: formData.pricing.salePrice,
        listPrice: formData.pricing.listPrice || formData.pricing.basePrice, // default if missing
        cost: formData.pricing.costPrice,
        currency: formData.pricing.currency,
        priceTiers: formData.pricing.priceTiers || [],
      },

      inventory: {
        trackQuantity: formData.inventory.trackQuantity !== false,
        quantity: formData.inventory.quantity,
        lowStockThreshold: formData.inventory.minStockLevel,
        allowBackorder: formData.inventory.allowBackorder || false,
        // keep internal fields if needed or drop them
      },

      images: formattedImages,
      videoUrls: formData.videoUrls,
      videoFiles: formData.videoFiles,

      specs: specsArray,
      variations: formData.variations,

      seo: formData.seo,
    };
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault(); // Prevent default form submission if triggered by event

    if (isSubmitting) return; // Prevent multiple submissions

    try {
      setIsSubmitting(true);
      const rawPayload = preparePayload();
      let finalPayload = rawPayload;
      let isMultipart = false;

      // Check if we have files to upload (images or videos)
      const hasFiles =
        (rawPayload.images && rawPayload.images.some((img) => img.file)) ||
        (rawPayload.videoFiles && rawPayload.videoFiles.length > 0);

      if (hasFiles) {
        if (process.env.NODE_ENV === "development") {
          console.log("Constructing Multipart FormData payload...");
        }
        isMultipart = true;
        const fd = new FormData();

        // Append all fields to FormData
        Object.keys(rawPayload).forEach((key) => {
          const value = rawPayload[key];

          if (key === "images") {
            // Append image files
            value.forEach((img) => {
              if (img.file) {
                fd.append("images", img.file);
              } else if (img.url) {
                // If we want to keep existing URLs (for editing), handle backend expectation
                // Usually backend expects separate field for existing URLs if mixing
                fd.append("existingImageUrls", img.url);
              }
            });
          } else if (key === "videoFiles") {
            // Append video files
            value.forEach((v) => {
              if (v.file) fd.append("videos", v.file);
            });
          } else if (key === "videoUrls") {
            // Append video URLs
            value.forEach((url) => fd.append("videoUrls", url));
          } else if (["pricing", "inventory", "seo"].includes(key)) {
            // Flatten nested objects (pricing, inventory, seo) for FormData
            if (value && typeof value === "object") {
              Object.keys(value).forEach((subKey) => {
                const subValue = value[subKey];
                if (Array.isArray(subValue)) {
                  // Handle arrays (e.g. pricing.priceTiers, seo.keywords)
                  subValue.forEach((item, idx) => {
                    if (item && typeof item === "object") {
                      Object.keys(item).forEach((itemKey) => {
                        fd.append(
                          `${key}[${subKey}][${idx}][${itemKey}]`,
                          item[itemKey]
                        );
                      });
                    } else {
                      fd.append(`${key}[${subKey}][${idx}]`, item);
                    }
                  });
                } else if (subValue !== null && subValue !== undefined) {
                  fd.append(`${key}[${subKey}]`, subValue);
                }
              });
            }
          } else if (typeof value === "object" && value !== null) {
            // Stringify complex objects that the backend might expect as JSON strings (e.g. specs, variations)
            // If specs/variations also fail, we might need to flatten them too.
            fd.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            // Append primitive values
            fd.append(key, value);
          }
        });

        finalPayload = fd;
      }

      console.log("🚀 Submitting Product Payload:", rawPayload);
      if (hasFiles) {
        // Log FormData entries for debugging since console.log(formData) is empty
        console.log("📦 FormData Entries:");
        for (let [key, value] of finalPayload.entries()) {
          console.log(`${key}:`, value);
        }
      }

      // Call the products API
      const { createProduct } = await import("@/services/productsService");

      // If multipart, we might need to rely on axios/client to set Content-Type automatically.
      // However, our apiClient/axios instance might force application/json.
      // We'll pass the payload. If productsService uses apiClient, we hope apiClient respects FormData.

      const response = await createProduct(finalPayload);

      // toast.success("Product created successfully!"); // Handled by modal now
      setShowSuccessModal(true);

      // Optional: Reset form or redirect after modal close
      // router.push(`/${router.locale || "en"}/inventory/products`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setShowSuccessModal(false);
    setCurrentStep(1);
    setShowReview(false);
    setFormData({
      // Reset to initial state (simplified for brevity, ideally use initial state constant)
      companyId: companyId || "",
      shopId: shopId || "",
      name: "",
      description: "",
      brand: "",
      manufacturer: "",
      tags: [],
      condition: "new",
      availability: "in_stock",
      visibility: "public",
      isFeatured: false,
      status: "active",
      images: [],
      videoUrls: [],
      videoFiles: [],
      pricing: {
        basePrice: 0,
        salePrice: null,
        listPrice: 0,
        costPrice: 0,
        currency: "USD",
        priceTiers: [],
      },
      inventory: {
        quantity: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
        trackQuantity: true,
        allowBackorder: false,
        sku: "",
        barcode: "",
      },
      supplierName: "",
      categoryId: "",
      categoryName: "",
      parentCategoryName: "",
      specs: {},
      variants: [],
      variations: [],
      seo: {
        metaTitle: "",
        metaDescription: "",
        keywords: [],
        slug: "",
      },
    });
  };

  const renderStep = () => {
    if (status === "loading") {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      );
    }

    if (showReview) {
      return (
        <ProductReview
          formData={formData}
          onEdit={(stepNumber) => {
            setShowReview(false);
            setCurrentStep(stepNumber);
          }}
        />
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
          errors={{}} // Pass errors if needed
        />
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1400px] mx-auto p-6">
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
            <div className="border-b border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-gray-600 mt-1">
                Fill in the product details step by step
              </p>
            </div>

            {/* Step Content */}
            <div className="p-6 min-h-[500px]">{renderStep()}</div>

            {/* Navigation */}
            <div className="border-t border-gray-200 p-6">
              <StepNavigation
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
                showReview={showReview}
                isValid={validateStep(currentStep)}
                isSubmitting={isSubmitting}
                onNext={handleNext}
                onPrevious={handlePrevious}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>

        {/* Vertical Step Indicator - Right Side */}
        <div className="col-span-12 lg:col-span-3 sticky top-6">
          {!showReview && status !== "loading" && (
            <div className="bg-white rounded-3xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Progress</h3>
              <StepIndicator
                currentStep={currentStep}
                steps={steps}
                orientation="vertical"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
