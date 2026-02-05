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
import { Loader2 } from "lucide-react";

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
    supplierName: "",
    sortOrder: 1,

    // Step 2: Media
    images: [],
    videoUrls: [],
    videoFiles: [],

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
      lowStockThreshold: 0,
      minReorderQty: 0,
      allowBackorder: false,
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
        return formData.inventory.stockQty >= 0;
      case "category":
        return formData.category.id !== "";
      case "specs":
        return true;
      case "variations":
        if (
          formData.variants?.length < 0 &&
          formData.variations?.length === 0
        ) {
          return false;
        }
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
      notificationBus.error("Please fill in all required fields");
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
    // Transform specifications object to array of {name, value}
    const specsArray = Object.entries(formData.specifications || {}).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    // Format images and STRIP base64 URLs if they have a binary file (Performance Fix)
    const formattedImages = formData.images.map((img, index) => {
      const isBase64 =
        typeof img.url === "string" && img.url.startsWith("data:");
      return {
        // If it's a new upload with a binary file, don't send the base64 URL in JSON
        // The backend will receive the actual file and generate its own URL
        url: isBase64 && img.file ? "" : img.url,
        alt: img.alt || `${formData.name} - Image ${index + 1}`,
        isPrimary: index === 0,
        sortOrder: index + 1,
      };
    });

    const payload = {
      companyId: formData.companyId,
      shopId: formData.shopId,
      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      manufacturer: formData.manufacturer,
      supplierName: formData.supplierName || formData.brand,
      tags: formData.tags,
      categoryId: formData.category.id,
      condition: formData.condition,
      availability: formData.availability,
      status: formData.status,
      visibility: formData.visibility,
      isFeatured: formData.isFeatured,
      sortOrder: formData.sortOrder,
      costPrice: formData.pricing.cost,

      pricing: {
        basePrice: formData.pricing.basePrice,
        salePrice: formData.pricing.salePrice,
        listPrice: formData.pricing.listPrice,
        cost: formData.pricing.cost,
        currency: formData.pricing.currency,
        priceTiers: formData.pricing.priceTiers || [],
      },

      inventory: {
        trackQuantity: formData.inventory.trackQuantity,
        stockQty: formData.inventory.stockQty,
        lowStockThreshold: formData.inventory.lowStockThreshold,
        minReorderQty: formData.inventory.minReorderQty,
        allowBackorder: formData.inventory.allowBackorder,
        safetyStock: formData.inventory.safetyStock,
      },

      images: formattedImages,
      videoUrls: formData.videoUrls,

      specs: specsArray,

      seo: {
        metaTitle: formData.seo.metaTitle,
        metaDescription: formData.seo.metaDescription,
        keywords: formData.seo.keywords,
      },
    };

    // Add optional fields only if they have data (Postman alignment)
    const hasIdentifiers = Object.values(formData.identifiers || {}).some(
      (v) => v !== ""
    );
    if (hasIdentifiers) {
      payload.identifiers = formData.identifiers;
    }

    if (formData.variants && formData.variants.length > 0) {
      // Backend 'variations' contains attribute definitions (formData.variants)
      payload.variations = formData.variants;
    }

    if (formData.variations && formData.variations.length > 0) {
      // Backend 'variants' contains generated combinations (formData.variations)
      payload.variants = formData.variations;
    }

    return payload;
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
        formData.images?.some((img) => img.file) ||
        formData.videoFiles?.some((v) => v.file);

      if (hasFiles) {
        if (process.env.NODE_ENV === "development") {
          console.log("Constructing Optimized Multipart FormData payload...");
        }
        isMultipart = true;
        const fd = new FormData();

        // Append the entire optimized metadata as a single JSON field
        // rawPayload already has base64 URLs stripped where binary files exist
        fd.append("productData", JSON.stringify(rawPayload));

        // Append binary files
        formData.images.forEach((img) => {
          if (img.file) fd.append("images", img.file);
        });

        if (formData.videoFiles) {
          formData.videoFiles.forEach((v) => {
            if (v.file) fd.append("videos", v.file);
          });
        }

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
      const { createProduct, updateProduct } = await import(
        "@/services/productsService"
      );

      let response;
      if (isEdit && initialData?._id) {
        response = await updateProduct(initialData._id, finalPayload);
      } else {
        response = await createProduct(finalPayload);
      }

      // toast.success("Product created successfully!"); // Handled by modal now
      setShowSuccessModal(true);
      notificationBus.success(
        isEdit
          ? "Product updated successfully!"
          : "Product created successfully!"
      );

      // Optional: Reset form or redirect after modal close
      // router.push(`/${locale}/inventory/products`);
    } catch (error) {
      console.error("Error creating product:", error);
      notificationBus.error(error.message || "Failed to create product");
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
          steps={steps}
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
                {isEdit ? "Edit Product" : "Add New Product"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isEdit
                  ? "Update the product details below"
                  : "Fill in the product details step by step"}
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
