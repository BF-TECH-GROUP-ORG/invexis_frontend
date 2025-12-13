"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import StepIndicator from "./shared/StepIndicator";
import StepNavigation from "./shared/StepNavigation";
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2Media from "./steps/Step2Media";
import Step3Pricing from "./steps/Step3Pricing";
import Step4Inventory from "./steps/Step4Inventory";
import Step5Category from "./steps/Step5Category";
import Step6Specs from "./steps/Step6Specs";
import Step7SEO from "./steps/Step7SEO";
import ProductReview from "./review/ProductReview";

const TOTAL_STEPS = 7;

export default function AddProductWizard({ companyId, shopId }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showReview, setShowReview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
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

    // Step 7: SEO
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: [],
      slug: "",
    },
  });

  const updateFormData = (updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.name.length >= 3;
      case 2:
      case 2:
        return true; // Images are now optional
      case 3:
        return formData.pricing.basePrice > 0;
      case 4:
        return formData.inventory.quantity >= 0;
      case 5:
        return formData.categoryId !== "";
      case 6:
        // Specs validation handled in Step6Specs
        return true;
      case 7:
        return formData.seo.metaTitle && formData.seo.slug;
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

      seo: formData.seo,
    };
  };

  const handleSubmit = async () => {
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
          } else if (typeof value === "object" && value !== null) {
            // Stringify complex objects (pricing, specs, inventory, seo, etc.)
            fd.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            // Append primitive values
            fd.append(key, value);
          }
        });

        finalPayload = fd;
      }

      // Call the products API
      const { createProduct } = await import("@/services/productsService");

      // If multipart, we might need to rely on axios/client to set Content-Type automatically.
      // However, our apiClient/axios instance might force application/json.
      // We'll pass the payload. If productsService uses apiClient, we hope apiClient respects FormData.

      const response = await createProduct(finalPayload);

      toast.success("Product created successfully!");
      router.push(`/${router.locale || "en"}/inventory/products`);
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (showReview) {
      return (
        <ProductReview
          formData={formData}
          onEdit={(step) => {
            setShowReview(false);
            setCurrentStep(step);
          }}
        />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo formData={formData} updateFormData={updateFormData} />
        );
      case 2:
        return (
          <Step2Media formData={formData} updateFormData={updateFormData} />
        );
      case 3:
        return (
          <Step3Pricing formData={formData} updateFormData={updateFormData} />
        );
      case 4:
        return (
          <Step4Inventory formData={formData} updateFormData={updateFormData} />
        );
      case 5:
        return (
          <Step5Category formData={formData} updateFormData={updateFormData} />
        );
      case 6:
        return (
          <Step6Specs formData={formData} updateFormData={updateFormData} />
        );
      case 7:
        return <Step7SEO formData={formData} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600 mt-1">
            Fill in the product details step by step
          </p>
        </div>

        {/* Step Indicator */}
        {!showReview && (
          <div className="p-6 border-b border-gray-200">
            <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          </div>
        )}

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
  );
}
