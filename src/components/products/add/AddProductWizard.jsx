"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast"; // Keep for other components if needed, or remove if fully replacing
import { useSession } from "next-auth/react";
import { useSnackbar } from "@/contexts/SnackbarContext";
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
  const params = useParams();
  const locale = params?.locale || "en";
  const { showSnackbar } = useSnackbar();
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
      showSnackbar("Please fill in all required fields", "error");
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
      file: img.file,
      _id: img._id, // Persist ID if exists
    }));

    const primaryImage =
      formattedImages.find((img) => img.isPrimary) ||
      formattedImages[0] ||
      null;

    return {
      companyId: formData.companyId,
      shopId: formData.shopId,

      // Core Info
      name: formData.name,
      description: formData.description,
      brand: formData.brand,
      manufacturer: formData.manufacturer,
      supplierName: formData.supplierName || formData.manufacturer,
      tags: formData.tags,
      slug:
        formData.seo?.slug ||
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),

      // Categorization
      category: {
        id: formData.categoryId,
        name: formData.categoryName,
        // Backend usually handles population of slug/level/parent
      },
      categoryId: formData.categoryId, // Keep for backward compatibility if needed

      // Status & Visibility
      status: {
        active: formData.status === "active",
        visible: formData.visibility === "public",
        featured: formData.isFeatured,
        availability: formData.availability,
        condition: formData.condition,
      },
      sortOrder: 0,

      // Pricing
      pricing: {
        basePrice: formData.pricing.basePrice,
        salePrice: formData.pricing.salePrice,
        listPrice: formData.pricing.listPrice || formData.pricing.basePrice,
        cost: formData.pricing.costPrice,
        currency: formData.pricing.currency,
        priceTiers: formData.pricing.priceTiers || [],
        profitRank: "normal", // Default
      },

      // Stock & Inventory
      stock: {
        total: formData.inventory.quantity,
        available: formData.inventory.quantity,
        reserved: 0,
        inStock: formData.inventory.quantity > 0,
        isLowStock:
          formData.inventory.quantity <= formData.inventory.minStockLevel,
        lowStockThreshold: formData.inventory.minStockLevel,
        trackQuantity: formData.inventory.trackQuantity !== false,
        allowBackorder: formData.inventory.allowBackorder || false,
        details: [], // Populated by backend usually
      },

      // Identifiers
      identifiers: {
        sku: formData.inventory.sku,
        barcode: formData.inventory.barcode,
        // Backend handles others like qrCode, asin, upc if not provided
      },

      // Media
      media: {
        images: formattedImages,
        videos: formData.videoUrls
          .map((url) => ({ type: "url", url }))
          .concat(
            formData.videoFiles.map((v) => ({ type: "file", file: v.file }))
          ),
        primaryImage: primaryImage,
      },
      // Keep root media arrays for FormData handling helper if needed,
      // but backend should prioritize 'media' object if structured that way.
      // However, for FormData logic below, we might need to adjust.
      // Let's keep the existing logic for keys but map them to the new structure.

      specifications: formData.specs,
      specsCategory: formData.parentCategoryName || null,

      variants: formData.variants || [],
      variations: formData.variations || [],

      seo: formData.seo,

      sales: {
        totalSold: 0,
        revenue: 0,
      },

      // Codes placeholder
      codes: {
        // Backend generates these
      },

      // Metadata placeholder
      metadata: {
        // Backend generates these
      },
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
      // Check if we have files to upload (images or videos)
      // Note: We need to check the deeply nested structure now
      const hasFiles =
        (rawPayload.media.images &&
          rawPayload.media.images.some((img) => img.file)) ||
        (rawPayload.media.videos &&
          rawPayload.media.videos.some((v) => v.file));

      if (hasFiles) {
        if (process.env.NODE_ENV === "development") {
          console.log("Constructing Multipart FormData payload...");
        }
        isMultipart = true;
        const fd = new FormData();

        // Append all fields to FormData
        // Append all fields to FormData using a recursive helper or manual mapping
        // Since the structure is now more complex, we need a smarter appender
        const appendToFormData = (data, rootKey) => {
          if (data instanceof File) {
            fd.append(rootKey, data);
          } else if (Array.isArray(data)) {
            data.forEach((item, index) => {
              // Special handling for file arrays if needed, but generic recursion works
              appendToFormData(item, `${rootKey}[${index}]`);
            });
          } else if (typeof data === "object" && data !== null) {
            // Check if it's a file wrapper from our preparing
            if (data.file && data.file instanceof File) {
              // It's an image/video object with a file
              // We might need to send the file separately or as part of the structure?
              // Usually FormData wants files in specific keys like "images" or "videos"
              // Adjust based on Backend Multer setup.
              // Assuming backend accepts 'images' and 'videos' as file arrays and others as text fields.
              // BUT, if we change structure, we must ensure backend parses `media[images][0][url]` etc.

              // STRATEGY:
              // 1. Append files to specific keys ('images', 'videos') for Multer
              // 2. Keep the object structure in the JSON part, but maybe nullify the 'file' property to avoid circular/hugeJSON

              if (rootKey.includes("images")) {
                fd.append("images", data.file);
              } else if (rootKey.includes("videos")) {
                fd.append("videos", data.file);
              }

              // We also append the metadata. recursion will handle properties of data
              Object.keys(data).forEach((key) => {
                if (key !== "file") {
                  appendToFormData(data[key], `${rootKey}[${key}]`);
                }
              });
            } else {
              Object.keys(data).forEach((key) => {
                appendToFormData(data[key], `${rootKey}[${key}]`);
              });
            }
          } else if (data !== undefined && data !== null) {
            fd.append(rootKey, data);
          }
        };

        // We can use the generic appender, but we need to match backend expectation for Files.
        // If Backend expects "images" field for files:
        if (rawPayload.media && rawPayload.media.images) {
          rawPayload.media.images.forEach((img) => {
            if (img.file) fd.append("images", img.file);
          });
        }
        if (rawPayload.media && rawPayload.media.videos) {
          rawPayload.media.videos.forEach((v) => {
            if (v.file) fd.append("videos", v.file);
          });
        }

        // For the rest of the body (text fields), we can stringify the big objects or flat append
        // Given the complex structure, JSON stringification of the body might be safer
        // IF the backend parses a 'data' field or similar.
        // But traditionally fields are flattened.
        // Let's Flatten excluding files.

        Object.keys(rawPayload).forEach((key) => {
          if (key === "media") {
            // Stringify media metadata (excluding file objects to save space/errors)
            const mediaClean = {
              ...rawPayload.media,
              images: rawPayload.media.images.map(({ file, ...rest }) => rest),
              videos: rawPayload.media.videos.map(({ file, ...rest }) => rest),
            };
            fd.append("media", JSON.stringify(mediaClean));
          } else if (
            typeof rawPayload[key] === "object" &&
            rawPayload[key] !== null
          ) {
            fd.append(key, JSON.stringify(rawPayload[key]));
          } else {
            fd.append(key, rawPayload[key]);
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
      showSnackbar("Product created successfully!", "success");

      // Optional: Reset form or redirect after modal close
      // router.push(`/${locale}/inventory/products`);
    } catch (error) {
      console.error("Error creating product:", error);
      showSnackbar(error.message || "Failed to create product", "error");
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
