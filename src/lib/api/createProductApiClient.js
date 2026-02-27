import productsService from "@/services/productsService";

/**
 * Enhanced Product Creation Client
 * 
 * Handles the complexities of:
 * 1. Detecting if data contains files (requires multipart/form-data)
 * 2. Normalizing payload for backend (stringifying JSON fields in multipart)
 * 3. Consistent error handling
 * 
 * @param {Object} formData - The raw form data from the wizard
 * @param {Object} options - Additional options (isEdit, productId)
 */
export async function createProductApiClient(formData, options = {}) {
    const { isEdit = false, productId = null } = options;

    // 1. Identify if we have files to upload
    const hasImages = formData.images?.some((img) => img.file);
    const hasFiles = hasImages;

    // 2. Prepare the base payload (metadata)
    const metadata = prepareMetadata(formData);

    let finalPayload;

    if (hasFiles) {
        // 3a. Construct Multipart FormData
        const fd = new FormData();

        // Backend normalization middleware expects 'productData' field
        fd.append("productData", JSON.stringify(metadata));

        // Append images
        if (hasImages) {
            formData.images.forEach((img) => {
                if (img.file) fd.append("images", img.file);
            });
        }

        finalPayload = fd;

        // 3c. Add a marker for the interceptor
        options.headers = {
            ...options.headers,
            'X-Is-Multipart': 'true'
        };
    } else {
        // 3b. Use pure JSON
        finalPayload = metadata;
    }

    // 4. Call the service
    try {
        if (process.env.NODE_ENV === "development") {
            console.log("[createProductApiClient] Submitting payload:", {
                isEdit,
                productId,
                hasFiles,
                payloadType: finalPayload instanceof FormData ? "FormData" : typeof finalPayload,
                imageCount: formData.images?.length,
                fileCount: formData.images?.filter(i => i.file)?.length
            });
        }
        if (isEdit && productId) {
            return await productsService.updateProduct(productId, finalPayload);
        } else {
            return await productsService.createProduct(finalPayload);
        }
    } catch (error) {
        console.error(`Error in createProductApiClient (${isEdit ? 'update' : 'create'}):`, error);
        throw error;
    }
}

/**
 * Strips binary files and prepares clean metadata for the API
 */
function prepareMetadata(formData) {
    // Transform specifications object to array of {name, value} for backend compatibility
    const specsArray = Object.entries(formData.specifications || {}).map(
        ([name, value]) => ({
            name,
            value,
        })
    );

    // Format images and STRIP base64 URLs if they have a binary file 
    // to avoid sending massive payloads in the JSON part of multipart
    const formattedImages = (formData.images || []).map((img, index) => {
        const isBase64 = typeof img.url === "string" && img.url.startsWith("data:");
        return {
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
        categoryId: formData.category?.id || formData.categoryId,
        condition: formData.condition,
        availability: formData.availability,
        status: formData.status,
        visibility: formData.visibility,
        isFeatured: formData.isFeatured,
        sortOrder: formData.sortOrder,
        costPrice: formData.pricing?.cost,

        pricing: {
            basePrice: formData.pricing?.basePrice || 0,
            salePrice: formData.pricing?.salePrice,
            listPrice: formData.pricing?.listPrice || 0,
            cost: formData.pricing?.cost || 0,
            currency: formData.pricing?.currency || "RWF",
            priceTiers: formData.pricing?.priceTiers || [],
        },

        inventory: {
            trackQuantity: formData.inventory?.trackQuantity ?? true,
            stockQty: formData.inventory?.stockQty || 0,
            lowStockThreshold: formData.inventory?.lowStockThreshold || 0,
            minReorderQty: formData.inventory?.minReorderQty || 0,
            allowBackorder: formData.inventory?.allowBackorder ?? false,
            safetyStock: formData.inventory?.safetyStock || 0,
        },

        images: formattedImages,

        specs: specsArray,

        seo: {
            metaTitle: formData.seo?.metaTitle || "",
            metaDescription: formData.seo?.metaDescription || "",
            keywords: formData.seo?.keywords || [],
        },
    };

    // Add optional identifiers if present
    const hasIdentifiers = Object.values(formData.identifiers || {}).some(
        (v) => v !== ""
    );
    if (hasIdentifiers) {
        payload.identifiers = formData.identifiers;
    }

    // Handle variations/variants mapping
    // If the wizard has 'variations', use that. The backend 'createProduct' controller
    // just spreads req.body into the Product model, so either might work depending on schema.
    // However, the wizard initializes 'variations' as an array.
    if (formData.variations && formData.variations.length > 0) {
        payload.variations = formData.variations;
    } else if (formData.variants && formData.variants.length > 0) {
        payload.variations = formData.variants;
    }

    return payload;
}
