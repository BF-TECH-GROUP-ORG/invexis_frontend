"use client";

import { useState, useEffect } from "react";

const INITIAL_FORM_DATA = {
  // Basic Info
  name: "",
  sku: "",
  category: "",
  subcategory: "",
  subSubcategory: "",
  slug: "",
  // pricing moved to nested object to match backend shape
  pricing: {
    basePrice: "",
    salePrice: "",
    currency: "USD",
    cost: "",
  },
  // legacy top-level fields kept for compatibility
  price: "",
  costPrice: "",
  description: "",
  supplier: "",
  manufacturer: "",

  // Inventory
  stock: "",
  minStockLevel: "",
  maxStockLevel: "",
  warehouse: "",
  expiryDate: "",

  // Specifications
  specifications: {
    brand: "",
    model: "",
    color: "",
    warranty: "",
  },

  // Media
  images: [],
  tags: [],

  // Variants / variations
  variants: [],
  variations: [],

  condition: 'new',
  availability: 'in_stock',

  // Advanced
  status: "active",
  visibility: "public",
  isTaxable: true,
  trackInventory: true,
  allowBackorder: false,
  isPerishable: false,
  notes: "",
  asin: "",           // Amazon Standard Identification Number
  upc: "",            // Universal Product Code
  bulletPoints: [],   // Product features/highlights

  // Discount
  discount: {
    enabled: false,
    type: "percentage",
    value: "",
    startDate: "",
    endDate: "",
  },

  // Return Policy
  returnPolicy: {
    allowed: true,
    days: 30,
    conditions: "",
    restockingFee: false,
    restockingFeePercent: "",
  },
  // SEO
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
  // Optional product flags
  featured: false,
  isActive: true,
  sortOrder: 0,
  browseNodeId: "",
};

export default function useProductForm(initialData = null) {
  const [formData, setFormData] = useState(initialData || INITIAL_FORM_DATA);
  
  // If initialData changes (e.g. when editing an existing product), populate the form
  useEffect(() => {
    if (!initialData) return;

    const src = initialData;
    const normalized = {
      // merge with defaults to ensure all fields exist
      ...INITIAL_FORM_DATA,
      ...src,
      pricing: {
        ...INITIAL_FORM_DATA.pricing,
        ...(src.pricing || {}),
      },
      specifications: {
        ...INITIAL_FORM_DATA.specifications,
        ...(src.specifications || src.specs || {}),
      },
      images: Array.isArray(src.images) ? src.images : src.images ? [src.images] : [],
      tags: Array.isArray(src.tags) ? src.tags : src.tags ? [src.tags] : [],
      manufacturer: src.manufacturer || INITIAL_FORM_DATA.manufacturer,
      upc: src.upc || INITIAL_FORM_DATA.upc,
      bulletPoints: Array.isArray(src.bulletPoints) ? src.bulletPoints : src.bulletPoints ? [src.bulletPoints] : INITIAL_FORM_DATA.bulletPoints,
      variants: Array.isArray(src.variants) ? src.variants : INITIAL_FORM_DATA.variants,
      variations: Array.isArray(src.variations) ? src.variations : INITIAL_FORM_DATA.variations,
      seo: { ...INITIAL_FORM_DATA.seo, ...(src.seo || {}) },
      price: src.price ?? (src.pricing && src.pricing.basePrice) ?? INITIAL_FORM_DATA.price,
      costPrice: src.costPrice ?? (src.pricing && src.pricing.cost) ?? INITIAL_FORM_DATA.costPrice,
      stock: src.stock ?? (src.inventory && src.inventory.quantity) ?? INITIAL_FORM_DATA.stock,
      warehouse: src.warehouse?.id || src.warehouse?._id || src.warehouse || INITIAL_FORM_DATA.warehouse,
      expiryDate: src.expiryDate || INITIAL_FORM_DATA.expiryDate,
      discount: src.discount || INITIAL_FORM_DATA.discount,
      returnPolicy: src.returnPolicy || INITIAL_FORM_DATA.returnPolicy,
    };

    setFormData(normalized);
  }, [initialData]);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [tagInput, setTagInput] = useState("");

  // Update form data
  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    
    // Clear related errors
    const newErrors = { ...errors };
    Object.keys(updates).forEach((key) => {
      delete newErrors[key];
    });
    setErrors(newErrors);
  };

  // Update nested fields (for specifications, discount, returnPolicy)
  const updateNestedField = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  // Validate current step
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Product name is required";
      }
      if (!formData.category) {
        newErrors.category = "Category is required";
      }
        const priceVal = formData.pricing?.basePrice !== undefined && formData.pricing?.basePrice !== "" ? formData.pricing.basePrice : formData.price;
        if (!priceVal || parseFloat(priceVal) <= 0) {
          newErrors.price = "Valid price is required";
        }
        const costVal = formData.pricing?.cost !== undefined && formData.pricing?.cost !== "" ? formData.pricing.cost : formData.costPrice;
        if (costVal && parseFloat(costVal) < 0) {
          newErrors.costPrice = "Cost price cannot be negative";
        }
    }

    // Inventory validation belongs to step 3 (Inventory)
    if (step === 3) {
      if (!formData.stock || parseInt(formData.stock) < 0) {
        newErrors.stock = "Valid stock quantity is required";
      }
      if (!formData.warehouse) {
        newErrors.warehouse = "Warehouse is required";
      }
    }

    if (step === 4) {
      if (formData.discount.enabled && formData.discount.value) {
        const discountValue = parseFloat(formData.discount.value);
        if (formData.discount.type === 'percentage' && (discountValue < 0 || discountValue > 100)) {
          newErrors.discountValue = "Percentage must be between 0 and 100";
        }
        if (formData.discount.type === 'fixed' && discountValue < 0) {
          newErrors.discountValue = "Discount amount cannot be negative";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const maxImages = 5;

    if (formData.images.length >= maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    files.forEach((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} exceeds 5MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          images: [
            ...prev.images,
            {
              url: reader.result,
              alt: file.name,
              isPrimary: prev.images.length === 0,
            },
          ].slice(0, maxImages),
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      if (newImages.length > 0 && !newImages.some(img => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }
      return { ...prev, images: newImages };
    });
  };

  // Set primary image
  const setPrimaryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  // Add tag
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  // Remove tag
  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      // support up to 5 steps (Basic, MoreInfo, Inventory, Media, Advanced)
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // Reset form
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setCurrentStep(1);
    setTagInput("");
  };

  return {
    formData,
    errors,
    currentStep,
    tagInput,
    setTagInput,
    updateFormData,
    updateNestedField,
    validateStep,
    handleImageUpload,
    removeImage,
    setPrimaryImage,
    addTag,
    removeTag,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
  };
}