"use client";

import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/store";
import {
  fetchProductById,
  deleteProduct,
} from "@/features/products/productsSlice";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import { ArrowLeft, Edit, Trash2, Download, QrCode, X } from "lucide-react";

function Field({ label, value }) {
  let display;
  if (value === undefined || value === null) display = "N/A";
  else if (React.isValidElement(value)) display = value;
  else if (typeof value === "object") {
    if (Array.isArray(value)) display = value.join(", ");
    else if (value.short) display = value.short;
    else display = JSON.stringify(value);
  } else display = value;

  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <div className="mt-1 font-medium wrap-break-word">{display}</div>
    </div>
  );
}

function DetailInner({ id }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const product = useSelector((s) => s.products.selectedProduct);
  const loading = useSelector((s) => s.products.loading);
  const [mainMedia, setMainMedia] = useState(null); // { type: 'image' | 'video' | 'youtube', url: string }
  const [activeTab, setActiveTab] = useState("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const mediaItems = React.useMemo(() => {
    if (!product) return [];
    const items = [];

    // Images
    const imgs = product.media?.images || product.images || [];
    if (Array.isArray(imgs)) {
      imgs.forEach((img) => {
        items.push({
          type: "image",
          url: img.url || img,
          thumb: img.url || img,
        });
      });
    }

    // Video Files
    const vids = product.media?.videos || product.videos || [];
    if (Array.isArray(vids)) {
      vids.forEach((vid) => {
        const url = vid.url || vid;
        if (typeof url === "string") {
          items.push({
            type: "video",
            url: url,
            thumb: "/placeholder-video.png", // Could use a clear indicator or specific icon
          });
        }
      });
    }

    // Video URLs (YouTube etc)
    const urls = product.videoUrls || product.media?.videoUrls || [];
    if (Array.isArray(urls)) {
      urls.forEach((url) => {
        if (url.includes("youtube.com") || url.includes("youtu.be")) {
          // Extract ID for thumb
          let videoId = "";
          if (url.includes("v=")) videoId = url.split("v=")[1]?.split("&")[0];
          else if (url.includes("youtu.be/"))
            videoId = url.split("youtu.be/")[1];

          items.push({
            type: "youtube",
            url: url,
            thumb: videoId
              ? `https://img.youtube.com/vi/${videoId}/0.jpg`
              : null,
            embedUrl: videoId
              ? `https://www.youtube.com/embed/${videoId}`
              : url,
          });
        } else {
          items.push({ type: "video_url", url: url, thumb: null });
        }
      });
    }

    return items;
  }, [product]);

  useEffect(() => {
    if (mediaItems.length > 0 && !mainMedia) {
      setMainMedia(mediaItems[0]);
    }
  }, [mediaItems, mainMedia]);

  const handleDelete = async () => {
    if (!confirm("Delete this product? This action cannot be undone.")) return;
    try {
      await dispatch(deleteProduct(product._id || product.id)).unwrap();
      toast.success("Product deleted");
      router.push(pathname.replace(/\/[^/]+$/, "/products"));
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  const handleEdit = () => {
    const base = (pathname || "").replace(/\/$/, "");
    router.push(`${base}/edit`);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(product || {}, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(product?.sku || product?.name || "product")
      .toString()
      .replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !product) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  const currency =
    product.pricing?.currency || product.pricingId?.currency || "RWF";
  const fmt = (v) =>
    typeof v === "number"
      ? new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
        }).format(v)
      : v ?? "N/A";

  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const nextLightbox = () =>
    setLightboxIndex((i) => (i + 1) % mediaItems.length);
  const prevLightbox = () =>
    setLightboxIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length);

  return (
    <div className="p-1 pt-5">
      <div className="max-w-9xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between px-8 py-6 border-b bg-white gap-4">
          <div className="flex items-start gap-5">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {product.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 uppercase tracking-wide">
                  {product.sku ||
                    product.identifiers?.sku ||
                    product.inventory?.sku ||
                    "No SKU"}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                    (
                      typeof product.status === "object"
                        ? product.status.active
                        : product.status !== "inactive"
                    )
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      (
                        typeof product.status === "object"
                          ? product.status.active
                          : product.status !== "inactive"
                      )
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  {(typeof product.status === "object"
                    ? product.status.active
                      ? "Active"
                      : "Inactive"
                    : product.status) ||
                    product.availability ||
                    "Unknown"}
                </span>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  {product.visibility || "public"}
                </span>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-[#081422] border border-gray-200">
                  {product.category?.name ||
                    product.categoryId?.name ||
                    "Uncategorized"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download size={18} /> <span>Export</span>
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-[#081422] hover:bg-[#081422]/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Edit size={18} /> <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Trash2 size={18} /> <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-2 bg-gray-50/50 border-b">
          <nav className="flex gap-6 overflow-x-auto no-scrollbar w-full">
            {[
              { id: "overview", label: "Overview" },
              { id: "pricing", label: "Pricing" },
              { id: "inventory", label: "Inventory" },
              { id: "media", label: "Media" },
              { id: "codes", label: "Codes" },
              { id: "specs", label: "Specs" },
              { id: "raw", label: "Raw Data" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`pb-4 pt-4 text-sm font-medium transition-all relative whitespace-nowrap ${
                  activeTab === t.id
                    ? "text-orange-600"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t.label}
                {activeTab === t.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Gallery Preview (Left Col) */}
          <div className="col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="w-full h-72 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center relative bg-black">
                {mainMedia ? (
                  mainMedia.type === "youtube" ? (
                    <iframe
                      src={mainMedia.embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      frameBorder="0"
                    />
                  ) : mainMedia.type === "video" ? (
                    <video
                      src={mainMedia.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <button
                      onClick={() =>
                        openLightbox(mediaItems.indexOf(mainMedia))
                      }
                      className="w-full h-full"
                    >
                      <img
                        src={mainMedia.url}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  )
                ) : (
                  <div className="text-gray-400">No media available</div>
                )}
              </div>

              {mediaItems.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {mediaItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setMainMedia(item)}
                      className={`h-20 rounded-md overflow-hidden border focus:outline-none focus:ring-2 focus:ring-orange-300 relative ${
                        mainMedia === item ? "ring-2 ring-orange-500" : ""
                      }`}
                    >
                      {item.type === "youtube" || item.type === "video" ? (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white text-xs">
                          {item.thumb ? (
                            <img
                              src={item.thumb}
                              className="w-full h-full object-cover opacity-70"
                            />
                          ) : (
                            "VIDEO"
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            ▶
                          </div>
                        </div>
                      ) : (
                        <img
                          src={item.url}
                          alt={`thumb-${i}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab content */}
            <div className="min-h-[300px]">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Selling Price</p>
                      <p className="text-xl font-bold text-green-600">
                        {fmt(
                          product.pricing?.basePrice ??
                            product.pricingId?.basePrice ??
                            product.price
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Cost Price</p>
                      <p className="text-xl font-semibold">
                        {fmt(
                          product.pricing?.cost ??
                            product.pricingId?.cost ??
                            product.costPrice
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="text-xl font-semibold">
                        {product.stock?.total ??
                          product.stock?.available ??
                          product.inventory?.quantity ??
                          0}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Total Value</p>
                      <p className="text-xl font-bold text-orange-600">
                        {fmt(
                          (product.pricing?.basePrice ??
                            product.pricingId?.basePrice ??
                            product.price ??
                            0) *
                            (product.stock?.total ??
                              product.stock?.available ??
                              product.inventory?.quantity ??
                              0)
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm text-gray-600 mb-2 font-bold">
                      Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label="Category"
                        value={
                          product.category?.name ||
                          product.categoryId?.name ||
                          product.category ||
                          "N/A"
                        }
                      />
                      <Field
                        label="Shop"
                        value={
                          product.shop?.name ||
                          product.shopId?.name ||
                          (typeof product.shopId === "string"
                            ? product.shopId
                            : "N/A")
                        }
                      />
                      <Field label="Brand" value={product.brand || "N/A"} />
                      <Field
                        label="Manufacturer"
                        value={product.manufacturer || "N/A"}
                      />
                      <Field
                        label="Date Entered"
                        value={
                          product.createdAt
                            ? new Date(product.createdAt).toLocaleString()
                            : "N/A"
                        }
                      />
                      {product.expiryDate && (
                        <Field
                          label="Expiry Date"
                          value={new Date(
                            product.expiryDate
                          ).toLocaleDateString()}
                        />
                      )}
                      {!product.expiryDate && (
                        <Field label="Expiry Date" value="Not Applicable" />
                      )}
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm text-gray-600 mb-2 font-bold">
                      Description
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {typeof product.description === "object" &&
                      product.description?.short
                        ? product.description.short
                        : typeof product.description === "string"
                        ? product.description
                        : "No description provided."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Selling Price"
                      value={fmt(
                        product.pricing?.basePrice ??
                          product.pricingId?.basePrice ??
                          product.price
                      )}
                    />
                    <Field
                      label="Cost Price"
                      value={fmt(
                        product.pricing?.cost ??
                          product.pricingId?.cost ??
                          product.costPrice
                      )}
                    />
                    <Field
                      label="Margin"
                      value={
                        product.pricing?.marginAmount ||
                        product.pricingId?.marginAmount
                          ? `${fmt(
                              product.pricing?.marginAmount ||
                                product.pricingId?.marginAmount
                            )} (${(
                              product.pricing?.marginPercent ||
                              product.pricingId?.marginPercent ||
                              0
                            ).toFixed(1)}%)`
                          : "N/A"
                      }
                    />
                    <Field
                      label="Profit Rank"
                      value={(
                        product.pricing?.profitRank ||
                        product.pricingId?.profitRank ||
                        "N/A"
                      ).toUpperCase()}
                    />
                    <Field
                      label="Discount"
                      value={
                        product.discount ?? product.pricing?.discount ?? "0"
                      }
                    />
                    <Field label="Currency" value={currency} />
                  </div>
                </div>
              )}

              {activeTab === "inventory" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label="Stock"
                      value={
                        product.stock?.total ??
                        product.stock?.available ??
                        product.inventory?.quantity ??
                        0
                      }
                    />
                    <Field
                      label="Min Stock (Low Threshold)"
                      value={
                        product.stock?.minStockLevel ??
                        product.inventory?.minStockLevel ??
                        product.stock?.lowStockThreshold ??
                        product.inventory?.lowStockThreshold ??
                        "N/A"
                      }
                    />
                    <Field
                      label="Max Stock"
                      value={
                        product.stock?.maxStockLevel ??
                        product.inventory?.maxStockLevel ??
                        "N/A"
                      }
                    />
                    <Field
                      label="Suggested Reorder Qty"
                      value={
                        product.stock?.details?.[0]?.suggestedReorderQty ??
                        product.stock?.suggestedReorderQty ??
                        "N/A"
                      }
                    />
                    <Field
                      label="Stockout Risk"
                      value={
                        product.stock?.details?.[0]?.stockoutRiskDays ||
                        product.stock?.stockoutRiskDays
                          ? `${
                              product.stock?.details?.[0]?.stockoutRiskDays ||
                              product.stock?.stockoutRiskDays
                            } Days`
                          : "N/A"
                      }
                    />
                    <Field
                      label="Allow Backorder"
                      value={
                        product.inventory?.allowBackorder ||
                        product.stock?.allowBackorder
                          ? "Yes"
                          : "No"
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-4">
                  {mediaItems.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      No media uploaded.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="border rounded-lg overflow-hidden group relative h-40"
                        >
                          {item.type === "image" ? (
                            <img
                              src={item.url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center relative">
                              {item.thumb && (
                                <img
                                  src={item.thumb}
                                  className="w-full h-full object-cover opacity-60"
                                />
                              )}
                              <div className="absolute text-white text-4xl">
                                ▶
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => {
                                setMainMedia(item);
                                openLightbox(idx);
                              }}
                              className="px-3 py-1 bg-white text-black text-xs rounded-full"
                            >
                              View
                            </button>
                            {/* Potential Delete Button here later */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "codes" && (
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
                      QR Code
                    </h3>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 inline-block">
                        {product.codes?.qrCodeUrl || product.qrCodeUrl ? (
                          <img
                            src={product.codes?.qrCodeUrl || product.qrCodeUrl}
                            alt="QR Code"
                            className="w-64 h-64 object-contain"
                          />
                        ) : (
                          <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">
                            No QR Code Available
                          </div>
                        )}
                      </div>
                      {(product.codes?.qrPayload || product.qrCode) && (
                        <p className="mt-3 text-sm text-gray-600 font-mono bg-gray-50 px-4 py-2 rounded">
                          {product.codes?.qrPayload || product.qrCode}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
                      Barcode
                    </h3>
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 inline-block border rounded-lg">
                        {product.codes?.barcodeUrl || product.barcodeUrl ? (
                          <img
                            src={
                              product.codes?.barcodeUrl || product.barcodeUrl
                            }
                            alt="Barcode"
                            className="h-32 object-contain"
                          />
                        ) : (
                          <div className="h-32 w-80 bg-gray-50 flex items-center justify-center text-gray-400 text-sm rounded-lg border-2 border-dashed">
                            No Barcode Available
                          </div>
                        )}
                      </div>
                      {(product.codes?.barcodePayload || product.barcode) && (
                        <p className="mt-3 text-sm text-gray-600 font-mono bg-gray-50 px-4 py-2 rounded tracking-widest">
                          {product.codes?.barcodePayload || product.barcode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="space-y-4">
                  <div className="bg-white border rounded-lg overflow-hidden">
                    {product.specifications &&
                    Object.keys(product.specifications).length > 0 ? (
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                          <tr>
                            <th className="px-6 py-3">Attribute</th>
                            <th className="px-6 py-3">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {Object.entries(product.specifications).map(
                            ([key, val]) => (
                              <tr key={key} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-900 capitalize">
                                  {key.replace(/_/g, " ")}
                                </td>
                                <td className="px-6 py-3 text-gray-600">
                                  {typeof val === "object"
                                    ? JSON.stringify(val)
                                    : val}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        No specifications found.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "raw" && (
                <div>
                  <h3 className="text-sm text-gray-600 mb-2">
                    Raw Product JSON
                  </h3>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto">
                    {JSON.stringify(product, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <div className="relative w-full max-w-6xl h-full flex flex-col justify-center px-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevLightbox();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                ◀
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextLightbox();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
              >
                ▶
              </button>

              <div className="w-full h-[80vh] flex items-center justify-center">
                {mediaItems[lightboxIndex]?.type === "youtube" ? (
                  <iframe
                    src={mediaItems[lightboxIndex].embedUrl}
                    className="w-full h-full max-w-4xl max-h-[600px]"
                    allowFullScreen
                    frameBorder="0"
                  />
                ) : mediaItems[lightboxIndex]?.type === "video" ? (
                  <video
                    src={mediaItems[lightboxIndex].url}
                    controls
                    className="w-full h-full object-contain"
                    autoPlay
                  />
                ) : (
                  <img
                    src={mediaItems[lightboxIndex]?.url}
                    alt={`lightbox-${lightboxIndex}`}
                    className="w-auto h-auto max-w-full max-h-full object-contain"
                  />
                )}
              </div>
              <p className="text-center text-white mt-4">
                {lightboxIndex + 1} / {mediaItems.length}
              </p>
            </div>
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 text-white hover:text-gray-300"
            >
              <X size={32} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailClient({ id }) {
  return (
    <Provider store={store}>
      <DetailInner id={id} />
    </Provider>
  );
}
