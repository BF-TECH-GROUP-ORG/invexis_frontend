"use client";

import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "@/store";
import {
  fetchProductById,
  deleteProduct,
} from "@/features/products/productsSlice";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  QrCode,
  X,
  Copy,
  Check,
} from "lucide-react";

const isDev = process.env.NEXT_PUBLIC_APP_PHASE === "development";
function Field({ label, value }) {
  const t = useTranslations("products.detail");
  let display;
  if (value === undefined || value === null) display = t("fields.none");
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
  const t = useTranslations("products.detail");
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const product = useSelector((s) => s.products.selectedProduct);
  const loading = useSelector((s) => s.products.loading);
  const [mainMedia, setMainMedia] = useState(null); // { type: 'image' | 'video' | 'youtube', url: string }
  const [activeTab, setActiveTab] = useState("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copiedRaw, setCopiedRaw] = useState(false);

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
    if (!confirm(t("deleteConfirm"))) return;
    try {
      await dispatch(deleteProduct(product._id || product.id)).unwrap();
      toast.success(t("successDelete")); // Need to add successDelete to JSON or use existing
      router.push(pathname.replace(/\/[^/]+$/, "/products"));
    } catch (err) {
      toast.error(t("errorDelete")); // Need to add errorDelete to JSON
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
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyRaw = () => {
    const dataStr = JSON.stringify(product || {}, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      setCopiedRaw(true);
      toast.success("Raw data copied to clipboard");
      setTimeout(() => setCopiedRaw(false), 2000);
    });
  };

  if (loading || !product) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">{t("loading")}</p>
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
      : v ?? t("fields.none");

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
                    t("noSku")}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${(
                    typeof product.status === "object"
                      ? product.status.active
                      : product.status?.toLowerCase() === "active"
                  )
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
                    }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${(
                      typeof product.status === "object"
                        ? product.status.active
                        : product.status?.toLowerCase() === "active"
                    )
                      ? "bg-green-500"
                      : "bg-red-500"
                      }`}
                  />
                  {(typeof product.status === "object"
                    ? product.status.active
                      ? t("fields.active")
                      : t("fields.inactive")
                    : product.status?.toLowerCase() === "active" ? t("fields.active") : product.status?.toLowerCase() === "inactive" ? t("fields.inactive") : product.status) ||
                    product.availability ||
                    t("unknown")}
                </span>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                  {product.visibility === "private" ? t("fields.private") : t("public")}
                </span>

                {product.isFeatured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                    ★ {t("featured")}
                  </span>
                )}

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-[#081422] border border-gray-200">
                  {product.category?.name || t("uncategorized")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download size={18} /> <span>{t("export")}</span>
            </button>
            <button
              onClick={handleEdit}
              className="px-4 py-2 bg-[#081422] hover:bg-[#081422]/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Edit size={18} /> <span>{t("edit")}</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Trash2 size={18} /> <span>{t("delete")}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-2 bg-gray-50/50 border-b">
          <nav className="flex gap-6 overflow-x-auto no-scrollbar w-full">
            {[
              { id: "overview", label: t("tabs.overview") },
              { id: "pricing", label: t("tabs.pricing") },
              { id: "inventory", label: t("tabs.inventory") },
              { id: "media", label: t("tabs.media") },
              { id: "variations", label: t("tabs.variations") },
              { id: "codes", label: t("tabs.codes") },
              { id: "specs", label: t("tabs.specs") },
              ...(isDev ? [{ id: "raw", label: t("tabs.raw") }] : []),
            ].map((tab) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`pb-4 pt-4 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === t.id
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
                  <div className="text-gray-400">{t("noMedia")}</div>
                )}
              </div>

              {mediaItems.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {mediaItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => setMainMedia(item)}
                      className={`h-20 rounded-md overflow-hidden border focus:outline-none focus:ring-2 focus:ring-orange-300 relative ${mainMedia === item ? "ring-2 ring-orange-500" : ""
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
                      <p className="text-xs text-gray-500">{t("cards.sellingPrice")}</p>
                      <p className="text-xl font-bold text-green-600">
                        {fmt(product.pricing?.basePrice)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">{t("cards.costPrice")}</p>
                      <p className="text-xl font-semibold">
                        {fmt(product.pricing?.cost)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">{t("cards.stock")}</p>
                      <p className="text-xl font-semibold">
                        {product.inventory?.stockQty ??
                          product.stock?.total ??
                          0}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">{t("cards.totalValue")}</p>
                      <p className="text-xl font-bold text-orange-600">
                        {fmt(
                          (product.pricing?.basePrice || 0) *
                          (product.inventory?.stockQty ??
                            product.stock?.total ??
                            0)
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm text-gray-600 mb-2 font-bold">
                      {t("sections.details")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label={t("fields.category")}
                        value={product.category?.name || t("fields.none")}
                      />
                      <Field label={t("fields.shopId")} value={product.shopId || t("fields.none")} />
                      <Field label={t("fields.brand")} value={product.brand || t("fields.none")} />
                      <Field
                        label={t("fields.manufacturer")}
                        value={product.manufacturer || t("fields.none")}
                      />
                      <Field
                        label={t("fields.sku")}
                        value={product.identifiers?.sku || t("fields.none")}
                      />
                      <Field
                        label={t("fields.asin")}
                        value={product.identifiers?.asin || t("fields.none")}
                      />
                      <Field
                        label={t("fields.upc")}
                        value={product.identifiers?.upc || t("fields.none")}
                      />
                      <Field
                        label={t("fields.scanId")}
                        value={product.identifiers?.scanId || t("fields.none")}
                      />
                      <Field
                        label={t("fields.dateEntered")}
                        value={
                          product.createdAt
                            ? new Date(product.createdAt).toLocaleString()
                            : t("fields.none")
                        }
                      />
                      <Field
                        label={t("fields.tags")}
                        value={
                          product.tags && product.tags.length > 0
                            ? product.tags.join(", ")
                            : t("fields.none")
                        }
                      />
                    </div>
                    {product.expiryDate && (
                      <Field
                        label={t("fields.expiryDate")}
                        value={new Date(
                          product.expiryDate
                        ).toLocaleDateString()}
                      />
                    )}
                    {!product.expiryDate && (
                      <Field label={t("fields.expiryDate")} value={t("fields.notApplicable")} />
                    )}
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm text-gray-600 mb-2 font-bold">
                      {t("sections.description")}
                    </h3>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {typeof product.description === "object" &&
                        product.description?.short
                        ? product.description.short
                        : typeof product.description === "string"
                          ? product.description
                          : t("sections.noDescription")}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "pricing" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label={t("cards.sellingPrice")}
                      value={fmt(product.pricing?.basePrice)}
                    />
                    <Field
                      label={t("cards.costPrice")}
                      value={fmt(product.pricing?.cost)}
                    />
                    <Field
                      label={t("fields.margin")}
                      value={
                        product.pricing?.marginAmount
                          ? `${fmt(product.pricing.marginAmount)} (${(
                            product.pricing.marginPercent || 0
                          ).toFixed(1)}%)`
                          : t("fields.none")
                      }
                    />
                    <Field
                      label={t("fields.profitRank")}
                      value={(
                        product.pricing?.profitRank || t("fields.none")
                      ).toUpperCase()}
                    />
                    <Field
                      label={t("fields.salePrice")}
                      value={
                        product.pricing?.salePrice
                          ? fmt(product.pricing.salePrice)
                          : t("fields.none")
                      }
                    />
                    <Field label={t("fields.currency")} value={currency} />
                  </div>
                </div>
              )}

              {activeTab === "inventory" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field
                      label={t("fields.totalStock")}
                      value={
                        product.inventory?.stockQty ?? product.stock?.total ?? 0
                      }
                    />
                    <Field
                      label={t("fields.available")}
                      value={
                        product.inventory?.stockQty ??
                        product.stock?.available ??
                        0
                      }
                    />
                    <Field
                      label={t("fields.lowStockThreshold")}
                      value={
                        product.inventory?.lowStockThreshold ??
                        product.stock?.lowStockThreshold ??
                        t("fields.none")
                      }
                    />
                    <Field
                      label={t("fields.minReorderQty")}
                      value={product.inventory?.minReorderQty ?? t("fields.none")}
                    />
                    <Field
                      label={t("fields.safetyStock")}
                      value={product.inventory?.safetyStock ?? t("fields.none")}
                    />
                    <Field
                      label={t("fields.allowBackorder")}
                      value={
                        product.inventory?.allowBackorder ??
                          product.stock?.allowBackorder
                          ? t("fields.yes")
                          : t("fields.no")
                      }
                    />
                    <Field
                      label={t("fields.trackQuantity")}
                      value={
                        product.inventory?.trackQuantity ??
                          product.stock?.trackQuantity
                          ? t("fields.yes")
                          : t("fields.no")
                      }
                    />
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-4">
                  {mediaItems.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      {t("media.noMedia")}
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
                              {t("media.view")}
                            </button>
                            {/* Potential Delete Button here later */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "variations" && (
                <div className="space-y-4">
                  <div className="bg-white border rounded-lg overflow-hidden">
                    {/* Backend 'variants' now contains the combinations based on our swap */}
                    {(product.variants && product.variants.length > 0) ||
                      (product.variations && product.variations.length > 0) ? (
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                          <tr>
                            <th className="px-6 py-3">{t("variations.variant")}</th>
                            <th className="px-6 py-3">{t("variations.sku")}</th>
                            <th className="px-6 py-3">{t("variations.price")}</th>
                            <th className="px-6 py-3">{t("variations.stock")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {/* combinations are in 'variants' based on payload alignment */}
                          {(product.variants || product.variations || []).map(
                            (variant, idx) => (
                              <tr
                                key={variant._id || idx}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-3 font-medium text-gray-900">
                                  {Object.entries(
                                    variant.attributes || variant.options || {}
                                  )
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(", ") || t("variations.default")}
                                </td>
                                <td className="px-6 py-3 text-gray-600">
                                  {variant.sku || t("fields.none")}
                                </td>
                                <td className="px-6 py-3 font-semibold text-green-600">
                                  {fmt(variant.price || variant.basePrice)}
                                </td>
                                <td className="px-6 py-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${(variant.stockQty ||
                                      variant.initialStock ||
                                      0) > 0
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                      }`}
                                  >
                                    {variant.stockQty ||
                                      variant.initialStock ||
                                      0}{" "}
                                    {t("variations.inStock")}
                                  </span>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center text-gray-500">
                        <QrCode size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">
                          {t("variations.none")}
                        </p>
                        <p className="text-sm">
                          {t("variations.simpleDesc")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "codes" && (
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">
                      {t("sections.qrCode")}
                    </h3>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 inline-block">
                        {product.codes?.qrCodeUrl || product.qrCodeUrl ? (
                          <img
                            src={product.codes?.qrCodeUrl || product.qrCodeUrl}
                            alt={t("sections.qrCode")}
                            className="w-64 h-64 object-contain"
                          />
                        ) : (
                          <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">
                            {t("sections.noQr")}
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
                      {t("sections.barcode")}
                    </h3>
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 inline-block border rounded-lg">
                        {product.codes?.barcodeUrl || product.barcodeUrl ? (
                          <img
                            src={
                              product.codes?.barcodeUrl || product.barcodeUrl
                            }
                            alt={t("sections.barcode")}
                            className="h-32 object-contain"
                          />
                        ) : (
                          <div className="h-32 w-80 bg-gray-50 flex items-center justify-center text-gray-400 text-sm rounded-lg border-2 border-dashed">
                            {t("sections.noBarcode")}
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
                    {(product.specs && product.specs.length > 0) ||
                      (product.specifications &&
                        Object.keys(product.specifications).length > 0) ? (
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
                          <tr>
                            <th className="px-6 py-3">{t("fields.attribute")}</th>
                            <th className="px-6 py-3">{t("fields.value")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {/* Prefer new specs array format */}
                          {product.specs && product.specs.length > 0
                            ? product.specs.map((s, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-900 capitalize">
                                  {s.name?.replace(/_/g, " ")}
                                </td>
                                <td className="px-6 py-3 text-gray-600">
                                  {typeof s.value === "object"
                                    ? JSON.stringify(s.value)
                                    : s.value}
                                </td>
                              </tr>
                            ))
                            : /* Fallback to legacy specifications object */
                            Object.entries(product.specifications || {}).map(
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
                        {t("sections.noSpecs")}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "raw" && (
                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                    <h3 className="text-sm font-semibold text-gray-700">
                      {t("sections.rawJson")}
                    </h3>
                    <button
                      onClick={handleCopyRaw}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {copiedRaw ? (
                        <>
                          <Check size={14} className="text-green-600" />
                          <span className="text-green-600">{t("copied")}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>{t("copyJson")}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-0 overflow-auto max-h-[600px] bg-[#1e1e1e]">
                    <pre className="text-xs font-mono text-gray-300 p-4 leading-relaxed">
                      {JSON.stringify(product, null, 2)}
                    </pre>
                  </div>
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
