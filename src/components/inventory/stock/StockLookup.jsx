// src/components/inventory/stock/StockLookup.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Package,
  QrCode,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { lookupProduct, stockOut } from "@/services/stockService";
import productsService from "@/services/productsService";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from "@mui/material";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTranslations } from "next-intl";

const ProductCarousel = ({ images = [], productName = "" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = useMemo(() => {
    if (images && images.length > 0) return images;
    // Fallback if no images
    return ["https://via.placeholder.com/400x400?text=No+Image+Available"];
  }, [images]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  const next = () => setCurrentIndex((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div
      className="relative w-full aspect-square bg-gray-50 rounded-xl overflow-hidden group border border-gray-100 shadow-inner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((url, i) => (
          <div key={url + i} className="w-full h-full flex-shrink-0">
            <img
              src={url}
              alt={`${productName} - ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 p-1.5 bg-black/10 backdrop-blur-md rounded-full">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? "bg-white w-4" : "bg-white/40"
                }`}
            />
          ))}
        </div>
      )}

      {/* Pause/Play Feedback Overlay (Micro animation) */}
      <div className={`absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-md transition-opacity duration-300 ${isPaused ? "opacity-100" : "opacity-0"}`}>
        <Pause size={12} className="text-white fill-white" />
      </div>
    </div>
  );
};

export default function StockLookup({
  onProductFound = () => { },
  productsCache = [],
  productsLoading = false,
  companyId = null,
  displayMode = "default", // 'scanner' will render larger QR/barcode
}) {
  const t = useTranslations("stockManagement.scanner");
  const td = useTranslations("stockManagement.dialogs.confirmStockOut");
  const [scanInput, setScanInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Stock-out dialog state
  const [isMounted, setIsMounted] = useState(false);
  const [outDialogOpen, setOutDialogOpen] = useState(false);
  const [outQty, setOutQty] = useState("");
  const [outReason, setOutReason] = useState("sale");
  const [outLoading, setOutLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { showSnackbar } = useSnackbar();
  // Filter suggestions from cached products by name / sku
  const suggestions = useMemo(() => {
    if (!scanInput.trim() || !productsCache?.length) return [];
    const q = scanInput.trim().toLowerCase();
    return productsCache
      .filter((p) => {
        const name = (p.name || p.ProductName || "").toLowerCase();
        const sku = (p.identifiers?.sku || p.sku || p.SKU || "").toLowerCase();
        return name.includes(q) || sku.includes(q);
      })
      .slice(0, 10);
  }, [scanInput, productsCache]);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;

    // If there are suggestions and the first is an exact match, select it instead of calling API
    if (suggestions.length > 0) {
      const s = suggestions[0];
      setProduct(s);
      onProductFound(s);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setProduct(null);

    try {
      // First try a company-scoped product search when we have companyId (for name searches)
      if (companyId) {
        try {
          const res = await productsService.getProducts({
            companyId,
            search: scanInput.trim(),
            limit: 20,
          });
          const foundList = res?.data || res || [];
          if (foundList && foundList.length === 1) {
            const foundProduct = foundList[0];
            setProduct(foundProduct);
            onProductFound(foundProduct);
            setSearchResults([]);
            return;
          }

          if (foundList && foundList.length > 1) {
            // multiple matches — let the user choose
            setSearchResults(foundList);
            return;
          }
        } catch (err) {
          // ignore and fallback to lookup by code
          console.debug(
            "productsService search failed, falling back to code lookup",
            err
          );
        }
      }

      // fallback to server lookup for scanned codes
      const result = await lookupProduct({ code: scanInput.trim() });
      const foundProduct = result?.data || result;
      setProduct(foundProduct);
      onProductFound(foundProduct);
    } catch (err) {
      setError(err.response?.data?.message || t("error"));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setScanInput("");
    setProduct(null);
    setError(null);
    setSearchResults([]);
  };

  const selectSuggestion = (p) => {
    setProduct(p);
    setScanInput(p.name || p.ProductName || p.identifiers?.sku || "");
    onProductFound(p);
    setError(null);
    setSearchResults([]);
    setShowSuggestions(false);
  };

  const handleStockOut = async () => {
    if (!product || !Number(outQty) || Number(outQty) <= 0) {
      setError(td("qtyError"));
      return;
    }
    setOutLoading(true);
    setError(null);
    try {
      await stockOut({
        companyId: product.companyId || undefined,
        shopId: product.shopId || product.metadata?.shopId || undefined,
        userId: undefined,
        productId: product._id || product.id,
        quantity: Number(outQty),
        reason: outReason,
      });
      setOutQty("");
      setOutReason("sale");
      setOutDialogOpen(false);
      showSnackbar(td("success"), "success");
      onProductFound && onProductFound(product);
    } catch (err) {
      const msg = err.response?.data?.message || td("failed");
      setError(msg);
      showSnackbar(msg, "error");
    } finally {
      setOutLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <QrCode size={20} className="text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t("title")}
          </h3>
          <p className="text-sm text-gray-500">
            {t("subtitle")}
          </p>
        </div>
      </div>

      <form onSubmit={handleLookup} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={scanInput}
            onChange={(e) => {
              setScanInput(e.target.value);
              setShowSuggestions(true);
              setSearchResults([]);
              setError(null);
            }}
            placeholder={t("placeholder")}
            className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            autoFocus
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />

          {/* Suggestions */}
          {showSuggestions &&
            suggestions.length > 0 &&
            scanInput.trim() &&
            !searchResults.length && (
              <ul className="absolute left-0 right-0 mt-14 bg-white border border-gray-200 rounded-lg shadow-sm z-20 max-h-60 overflow-auto">
                {suggestions.map((s) => (
                  <li
                    key={s._id || s.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => selectSuggestion(s)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {s.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.identifiers?.sku || s.sku || ""}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {s.stock?.available ?? s.stock?.total ?? s.stock ?? 0}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

          {/* Server search results (choose one) */}
          {searchResults.length > 0 && (
            <ul className="absolute left-0 right-0 mt-14 bg-white border border-gray-200 rounded-lg shadow-sm z-20 max-h-72 overflow-auto">
              {searchResults.map((s) => (
                <li
                  key={s._id || s.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setProduct(s);
                    setScanInput(s.name || s.identifiers?.sku || "");
                    onProductFound(s);
                    setSearchResults([]);
                    setShowSuggestions(false);
                    setError(null);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {s.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {s.identifiers?.sku || s.sku || ""}
                      </div>
                      <div className="text-xs text-gray-400">
                        {t("shop")}: {s.shopId || s.metadata?.shopId || "-"}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {s.stock?.available ?? s.stock?.total ?? s.stock ?? 0}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !scanInput.trim()}
            className="flex-1 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("searching")}
              </>
            ) : (
              <>
                <Search size={18} />
                {t("lookupBtn")}
              </>
            )}
          </button>
          {(product || error) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              {t("clearBtn")}
            </button>
          )}
        </div>
      </form>

      {/* Loading cached products indicator */}
      {productsLoading && (
        <div className="mt-4 text-sm text-gray-500">{t("loadingProducts")}</div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-red-800">{t("error")}</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Product Found */}
      {product && (
        <div className="mt-6 p-4 bg-green-50/50 border border-green-100 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-500" size={18} />
            <p className="text-xs font-bold uppercase tracking-wider text-green-700">
              {t("productSelected")}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            <div className="flex flex-col md:flex-row gap-0">
              {/* Image Section */}
              <div className="w-full md:w-48 shrink-0">
                <ProductCarousel
                  images={product.images || product.Images}
                  productName={product.name || product.ProductName}
                />
              </div>

              {/* Details Section */}
              <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-gray-900 text-lg leading-tight truncate">
                      {product.name || product.ProductName}
                    </h4>
                  </div>
                  <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-tighter">
                    {t("sku")}: {product.identifiers?.sku || product.sku || "N/A"}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t("stock")}</p>
                      <p className="text-lg font-black text-orange-600">
                        {product.stock?.available ?? product.stock ?? 0}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{t("shop")}</p>
                      <p className="text-sm font-bold text-gray-700 truncate">
                        {product.shopId || product.metadata?.shopId || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    onClick={() => setOutDialogOpen(true)}
                    className="w-full py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-all shadow-sm hover:shadow-red-200 active:scale-[0.98]"
                  >
                    {t("stockOutBtn")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMounted && (
        <Dialog
          open={outDialogOpen}
          onClose={() => setOutDialogOpen(false)}
        >
          <DialogTitle>{td("title")}</DialogTitle>
          <DialogContent>
            <div className="space-y-3 mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {td("qty")}
                </label>
                <TextField
                  value={outQty}
                  onChange={(e) => setOutQty(e.target.value)}
                  type="number"
                  inputProps={{ min: 1 }}
                  fullWidth
                  size="small"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {td("reason")}
                </label>
                <TextField
                  select
                  value={outReason}
                  onChange={(e) => setOutReason(e.target.value)}
                  fullWidth
                  size="small"
                >
                  {["sale", "damaged", "expired", "transferOut", "other"].map((r) => (
                    <MenuItem key={r} value={r}>
                      {td(`reasons.${r}`)}
                    </MenuItem>
                  ))}
                </TextField>
              </div>

              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOutDialogOpen(false)}>
              {td("cancel")}
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleStockOut}
            >
              {outLoading ? td("processing") : td("confirm")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
