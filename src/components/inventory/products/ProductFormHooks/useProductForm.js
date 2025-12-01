// src/components/inventory/products/ProductFormHooks/useProductForm.js
"use client";

import { useState, useEffect } from "react";

const INITIAL_FORM_DATA = {
  // Basic Info
  name: "",
  brand: "",
  manufacturer: "",
  category: "",
  tags: [],
  description: {
    short: "",
    long: ""
  },
  condition: 'new',
  availability: 'in_stock',

  // Attributes (Dynamic)
  attributes: [],

  // Pricing & Inventory
  pricing: {
    basePrice: "",
    salePrice: "",
    listPrice: "",
    cost: "",
    currency: "USD",
  },
  inventory: {
    trackQuantity: true,
    quantity: "",
    lowStockThreshold: 10,
    allowBackorder: false,
  },

  // Media
  images: [],
  videoUrls: [],

  // Variations
  variants: [],
  variations: [],

  // Advanced / Settings
  status: "active",
  visibility: "public",
  featured: false,
  isActive: true,
  sortOrder: 0,
  seo: {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
  },
};

export default function useProductForm(initialData = null) {
  const [formData, setFormData] = useState(initialData || INITIAL_FORM_DATA);

  // If initialData changes (e.g. when editing an existing product), populate the form
  useEffect(() => {
    if (!initialData) return;

    const src = initialData;
    const normalized = {
      ...INITIAL_FORM_DATA,
      ...src,
      pricing: {
        ...INITIAL_FORM_DATA.pricing,
        ...(src.pricing || {}),
      },
      inventory: {
        ...INITIAL_FORM_DATA.inventory,
        ...(src.inventory || {}),
      },
      description: {
        ...INITIAL_FORM_DATA.description,
        ...(src.description || {}),
      },
      seo: {
        ...INITIAL_FORM_DATA.seo,
        ...(src.seo || {}),
      },
      images: Array.isArray(src.images) ? src.images : [],
      tags: Array.isArray(src.tags) ? src.tags : [],
      attributes: Array.isArray(src.attributes) ? src.attributes : [],
      videoUrls: Array.isArray(src.videoUrls) ? src.videoUrls : [],
      variants: Array.isArray(src.variants) ? src.variants : [],
      variations: Array.isArray(src.variations) ? src.variations : [],
    };

    // Handle flat fields mapping to nested if necessary (legacy support)
    if (src.price && !normalized.pricing.basePrice) normalized.pricing.basePrice = src.price;
    if (src.stock && !normalized.inventory.quantity) normalized.inventory.quantity = src.stock;

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

  // Update nested fields
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

    // Step 1: Basic Info
    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Product name is required";
      }
      if (!formData.category) {
        newErrors.category = "Category is required";
      }
    }

    // Step 3: Inventory (Pricing & Stock)
    if (step === 3) {
      if (!formData.pricing?.basePrice) {
        newErrors.price = "Base Price is required";
      }
      if (formData.inventory?.quantity === undefined || formData.inventory?.quantity === "") {
        newErrors.stock = "Quantity is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle image upload with aggressive compression for 5+ images
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB per file
    const maxImages = 10;

    if (formData.images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed. You can upload ${maxImages - formData.images.length} more.`);
      return;
    }

    let processedCount = 0;
    const totalFiles = files.length;

    files.forEach((file) => {
      if (file.size > maxSize) {
        alert(`${file.name} exceeds 5MB limit`);
        processedCount++;
        return;
      }

      // Compress image before upload
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 600px for better compression)
          let width = img.width;
          let height = img.height;
          const maxDimension = 600; // Reduced from 800 for better compression

          if (width > height && width > maxDimension) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress (60% quality for smaller file size)
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);

          setFormData((prev) => ({
            ...prev,
            images: [
              ...prev.images,
              {
                url: compressedDataUrl,
                alt: file.name,
                isPrimary: prev.images.length === 0,
              },
            ].slice(0, maxImages),
          }));

          processedCount++;

          // Show success message when all images are processed
          if (processedCount === totalFiles) {
            console.log(`✅ Successfully uploaded ${totalFiles} image(s)`);
          }
        };
        img.src = reader.result;
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
      // support up to 6 steps
      setCurrentStep((prev) => Math.min(prev + 1, 6));
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
    setCurrentStep, // Exposed for manual control if needed
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