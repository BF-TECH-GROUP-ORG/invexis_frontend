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
import { fetchWarehouses } from "@/features/warehouses/warehousesSlice";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  QrCode,
  X,
  Copy,
  Check,
  DollarSign,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Bell,
  Truck,
  Percent,
  Trophy,
  PlayCircle,
  Eye,
  Video,
  Printer,
} from "lucide-react";
import shopService from "@/services/shopService";

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
  const { data: session } = useSession();
  const product = useSelector((s) => s.products.selectedProduct);
  const loading = useSelector((s) => s.products.loading);
  const warehouses = useSelector((s) => s.warehouses.items || []);
  const [mainMedia, setMainMedia] = useState(null); // { type: 'image' | 'video' | 'youtube', url: string }
  const [activeTab, setActiveTab] = useState("overview");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [codeSubTab, setCodeSubTab] = useState("qr");
  const [resolvedShopName, setResolvedShopName] = useState("");

  useEffect(() => {
    const resolveShop = async () => {
      if (!product?.shopId) {
        setResolvedShopName("");
        return;
      }

      // 1. Try product data
      if (product.shop?.name || product.branch?.name) {
        setResolvedShopName(product.shop?.name || product.branch?.name);
        return;
      }

      // 2. Try Redux store
      const foundInStore = warehouses.find(
        (w) => w._id === product.shopId || w.id === product.shopId
      );
      if (foundInStore) {
        setResolvedShopName(foundInStore.name);
        return;
      }

      // 3. API Fallback
      try {
        const companyObj = session?.user?.companies?.[0];
        const companyId = typeof companyObj === "string" ? companyObj : companyObj?.id || companyObj?._id || session?.user?.companyId || session?.user?.company?._id;
        const shopRes = await shopService.getShopById(product.shopId, companyId);

        // Deep check for name in response
        const name = shopRes?.name || shopRes?.data?.name || shopRes?.shop?.name;

        if (name) {
          setResolvedShopName(name);
        } else {
          // If we got a response but no name, maybe the field is different or it's just the ID
          setResolvedShopName("Invexis Shop");
        }
      } catch (error) {
        setResolvedShopName("Invexis Shop");
      }
    };

    resolveShop();
  }, [product, warehouses]);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
      dispatch(fetchWarehouses());
    }
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

  const handlePrintCode = (type, url, payload) => {
    const printWindow = window.open("", "_blank");

    const html = `
      <html>
        <head>
          <title>Print ${type}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 0;
              margin: 0;
              color: #081422;
              min-height: 100vh;
            }
            .container {
              padding: 20px;
              text-align: center;
              width: 100%;
              max-width: 320px;
            }
            img { 
              max-width: 100%; 
              height: auto;
              margin-bottom: 12px;
            }
            .name { 
              font-size: 18px; 
              font-weight: 900; 
              margin-bottom: 16px; 
              text-transform: uppercase;
              letter-spacing: -0.02em;
            }
            .shop { 
              font-size: 14px; 
              color: #081422; 
              font-weight: 800; 
              margin-top: 8px;
            }
            .payload { 
              margin-top: 16px;
              font-family: monospace;
              font-size: 10px;
              color: #9ca3af;
              word-break: break-all;
            }
            @media print {
              body { margin: 0; padding: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1 class="name">${product.name}</h1>
            <img src="${url}" />
            <div class="shop">${resolvedShopName || "Invexis Shop"}</div>
            <div class="payload">${payload}</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

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
              disabled
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed transition-colors flex items-center gap-2 shadow-sm opacity-60"
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
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 pt-4 text-sm font-medium transition-all relative whitespace-nowrap ${activeTab === tab.id
                  ? "text-orange-600"
                  : "text-gray-500 hover:text-gray-800"
                  }`}
              >
                {tab.label}
                {activeTab === tab.id && (
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
                  <div className="text-gray-400">{t("media.noMedia")}</div>
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
                    <div className="p-5 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={14} className="text-green-500" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("cards.sellingPrice")}</p>
                      </div>
                      <p className="text-xl font-extrabold text-green-600">
                        {fmt(product.pricing?.basePrice)}
                      </p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 size={14} className="text-blue-500" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("cards.costPrice")}</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {fmt(product.pricing?.cost)}
                      </p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-orange-500" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("cards.stock")}</p>
                      </div>
                      <p className="text-xl font-bold text-gray-900">
                        {product.inventory?.stockQty ??
                          product.stock?.total ??
                          0}
                      </p>
                    </div>
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl shadow-sm transition-all hover:shadow-md hover:scale-[1.02]">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown size={14} className="text-purple-500" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t("cards.totalValue")}</p>
                      </div>
                      <p className="text-xl font-extrabold text-[#081422]">
                        {fmt(
                          (product.pricing?.basePrice || 0) *
                          (product.inventory?.stockQty ??
                            product.stock?.total ??
                            0)
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {t("sections.details")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label={t("fields.category")}
                        value={product.category?.name || t("fields.none")}
                      />
                      <Field
                        label={t("fields.shopId")}
                        value={resolvedShopName || (product.shopId ? "Loading..." : t("fields.none"))}
                      />
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

                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
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
                <div className="space-y-6">
                  {/* Primary Pricing Section */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {t("tabs.pricing")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                          <DollarSign size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {t("cards.sellingPrice")}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {fmt(product.pricing?.basePrice)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                          <BarChart3 size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {t("cards.costPrice")}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {fmt(product.pricing?.cost)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                          <Percent size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {t("fields.margin")}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {product.pricing?.marginAmount
                              ? `${fmt(product.pricing.marginAmount)} (${(
                                product.pricing.marginPercent || 0
                              ).toFixed(1)}%)`
                              : t("fields.none")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                          <Trophy size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {t("fields.profitRank")}
                          </p>
                          <span className="inline-block px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase rounded-md border border-purple-100">
                            {product.pricing?.profitRank || t("fields.none")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Details Section */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      More Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label={t("fields.salePrice")}
                        value={
                          product.pricing?.salePrice ? (
                            <span className="text-green-600 font-bold">
                              {fmt(product.pricing.salePrice)}
                            </span>
                          ) : (
                            t("fields.none")
                          )
                        }
                      />
                      <Field label={t("fields.currency")} value={currency} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "inventory" && (
                <div className="space-y-6">
                  {/* Stock Levels Section */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      Stock Levels
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                          <Package size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {t("fields.totalStock")}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {product.inventory?.stockQty ?? product.stock?.total ?? 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                          <Check size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                            {t("fields.available")}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {product.inventory?.stockQty ?? product.stock?.available ?? 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reorder Settings Section */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Alerts & Reordering
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-1 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                          <Bell size={16} />
                          <p className="text-[10px] font-bold uppercase tracking-wider">
                            {t("fields.lowStockThreshold")}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {product.inventory?.lowStockThreshold ?? product.stock?.lowStockThreshold ?? t("fields.none")}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                          <Truck size={16} />
                          <p className="text-[10px] font-bold uppercase tracking-wider">
                            {t("fields.minReorderQty")}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {product.inventory?.minReorderQty ?? t("fields.none")}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 p-4 rounded-xl bg-gray-50/50 border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                          <Package size={16} />
                          <p className="text-[10px] font-bold uppercase tracking-wider">
                            {t("fields.safetyStock")}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {product.inventory?.safetyStock ?? t("fields.none")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Section */}
                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      Inventory Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field
                        label={t("fields.allowBackorder")}
                        value={
                          product.inventory?.allowBackorder ?? product.stock?.allowBackorder ? (
                            <span className="text-green-600 font-bold">{t("fields.yes")}</span>
                          ) : (
                            <span className="text-gray-400">{t("fields.no")}</span>
                          )
                        }
                      />
                      <Field
                        label={t("fields.trackQuantity")}
                        value={
                          product.inventory?.trackQuantity ?? product.stock?.trackQuantity ? (
                            <span className="text-green-600 font-bold">{t("fields.yes")}</span>
                          ) : (
                            <span className="text-gray-400">{t("fields.no")}</span>
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "media" && (
                <div className="space-y-6">
                  <div className="bg-white border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        {t("tabs.media")}
                      </h3>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded border">
                        {mediaItems.length} {t("tabs.media").toLowerCase()}
                      </span>
                    </div>

                    {mediaItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30 rounded-2xl border-2 border-dashed border-gray-100">
                        <div className="p-4 bg-gray-100 rounded-full text-gray-400 mb-4 text-2xl">
                          <X size={32} />
                        </div>
                        <p className="text-gray-400 text-sm italic font-medium">
                          {t("media.noMedia")}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                        {mediaItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="group relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:ring-4 hover:ring-orange-50"
                          >
                            {item.type === "image" ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={item.url}
                                  alt=""
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                {idx === 0 && (
                                  <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg border border-gray-100 flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-bold text-gray-900 uppercase">Primary</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="relative w-full h-full bg-[#081422]">
                                {item.thumb ? (
                                  <img
                                    src={item.thumb}
                                    alt=""
                                    className="w-full h-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-110"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                                    <Video size={48} strokeWidth={1} />
                                  </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:border-orange-400">
                                    <PlayCircle size={24} fill="currentColor" fillOpacity={0.2} />
                                  </div>
                                </div>
                                <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur shadow-sm rounded-lg border border-white/10 flex items-center gap-1.5">
                                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Video</span>
                                </div>
                              </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                              <button
                                onClick={() => {
                                  setMainMedia(item);
                                  openLightbox(idx);
                                }}
                                className="w-full py-2.5 bg-white text-gray-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 shadow-lg active:scale-95"
                              >
                                <Eye size={14} />
                                {t("media.view")}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                  {/* Sub-Navigation */}
                  <div className="flex p-2 bg-gray-50/50 border-b">
                    <button
                      onClick={() => setCodeSubTab("qr")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${codeSubTab === "qr"
                        ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      <QrCode size={16} />
                      {t("sections.qrCode")}
                    </button>
                    <button
                      onClick={() => setCodeSubTab("barcode")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${codeSubTab === "barcode"
                        ? "bg-white text-orange-600 shadow-sm border border-orange-100"
                        : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      <BarChart3 size={16} />
                      {t("sections.barcode")}
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="p-8">
                    <AnimatePresence mode="wait">
                      {codeSubTab === "qr" ? (
                        <motion.div
                          key="qr"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-inner inline-block ring-8 ring-gray-50">
                            {product.codes?.qrCodeUrl || product.qrCodeUrl ? (
                              <img
                                src={product.codes?.qrCodeUrl || product.qrCodeUrl}
                                alt={t("sections.qrCode")}
                                className="w-48 h-48 md:w-64 md:h-64 object-contain"
                              />
                            ) : (
                              <div className="w-48 h-48 md:w-64 md:h-64 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
                                {t("sections.noQr")}
                              </div>
                            )}
                          </div>
                          {(product.codes?.qrPayload || product.qrCode) && (
                            <div className="mt-8 px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 group transition-all hover:bg-white hover:border-orange-200">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white border px-2 py-0.5 rounded shadow-sm">
                                Payload
                              </span>
                              <code className="text-sm text-gray-600 font-mono tracking-wider">
                                {product.codes?.qrPayload || product.qrCode}
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(product.codes?.qrPayload || product.qrCode);
                                  toast.success("Copied to clipboard");
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all border border-transparent hover:border-orange-100"
                                title="Copy Payload"
                              >
                                <Copy size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">Copy</span>
                              </button>
                              <div className="w-px h-4 bg-gray-200" />
                              <button
                                onClick={() => handlePrintCode("QR Code", product.codes?.qrCodeUrl || product.qrCodeUrl, product.codes?.qrPayload || product.qrCode)}
                                className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all border border-transparent hover:border-orange-100"
                                title="Print QR Code"
                              >
                                <Printer size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">Print</span>
                              </button>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="barcode"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col items-center justify-center"
                        >
                          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm inline-block w-full max-w-2xl ring-8 ring-gray-50 overflow-hidden">
                            {product.codes?.barcodeUrl || product.barcodeUrl ? (
                              <img
                                src={product.codes?.barcodeUrl || product.barcodeUrl}
                                alt={t("sections.barcode")}
                                className="w-full h-32 object-contain"
                              />
                            ) : (
                              <div className="h-32 w-full bg-gray-50 flex items-center justify-center text-gray-400 text-sm rounded-xl border-2 border-dashed border-gray-200">
                                {t("sections.noBarcode")}
                              </div>
                            )}
                          </div>
                          {(product.codes?.barcodePayload || product.barcode) && (
                            <div className="mt-8 px-6 py-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 group transition-all hover:bg-white hover:border-orange-200">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white border px-2 py-0.5 rounded shadow-sm">
                                Payload
                              </span>
                              <code className="text-sm text-gray-600 font-mono tracking-[0.3em]">
                                {product.codes?.barcodePayload || product.barcode}
                              </code>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(product.codes?.barcodePayload || product.barcode);
                                  toast.success("Copied to clipboard");
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all border border-transparent hover:border-orange-100"
                                title="Copy Payload"
                              >
                                <Copy size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">Copy</span>
                              </button>
                              <div className="w-px h-4 bg-gray-200" />
                              <button
                                onClick={() => handlePrintCode("Barcode", product.codes?.barcodeUrl || product.barcodeUrl, product.codes?.barcodePayload || product.barcode)}
                                className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all border border-transparent hover:border-orange-100"
                                title="Print Barcode"
                              >
                                <Printer size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">Print</span>
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {activeTab === "specs" && (
                <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50/50 p-4 border-b">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {t("tabs.specs")}
                    </h3>
                  </div>
                  <div className="p-0">
                    {(product.specs && product.specs.length > 0) ||
                      (product.specifications &&
                        Object.keys(product.specifications).length > 0) ? (
                      <div className="divide-y divide-gray-100">
                        {/* Prefer new specs array format */}
                        {product.specs && product.specs.length > 0
                          ? product.specs.map((s, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row md:items-center py-4 px-6 hover:bg-gray-50/50 transition-colors">
                              <div className="md:w-1/3 mb-1 md:mb-0">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                  {s.name?.replace(/_/g, " ")}
                                </span>
                              </div>
                              <div className="md:w-2/3">
                                <p className="text-sm text-gray-900 font-medium">
                                  {typeof s.value === "object"
                                    ? JSON.stringify(s.value)
                                    : s.value}
                                </p>
                              </div>
                            </div>
                          ))
                          : /* Fallback to legacy specifications object */
                          Object.entries(product.specifications || {}).map(
                            ([key, val]) => (
                              <div key={key} className="flex flex-col md:flex-row md:items-center py-4 px-6 hover:bg-gray-50/50 transition-colors">
                                <div className="md:w-1/3 mb-1 md:mb-0">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                </div>
                                <div className="md:w-2/3">
                                  <p className="text-sm text-gray-900 font-medium">
                                    {typeof val === "object"
                                      ? JSON.stringify(val)
                                      : val}
                                  </p>
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30">
                        <div className="p-4 bg-gray-100 rounded-full text-gray-400 mb-4">
                          <X size={32} />
                        </div>
                        <p className="text-gray-400 text-sm italic font-medium">
                          {t("sections.noSpecs")}
                        </p>
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
        </div >

        {/* Lightbox */}
        {
          lightboxOpen && (
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
          )
        }
      </div >
    </div >
  );
}

export default function ProductDetailClient({ id }) {
  return (
    <Provider store={store}>
      <DetailInner id={id} />
    </Provider>
  );
}
