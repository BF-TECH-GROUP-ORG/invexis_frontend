// src/components/inventory/stock/StockLookup.jsx
"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Package,
  QrCode,
  AlertCircle,
  CheckCircle,
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

export default function StockLookup({
  onProductFound = () => {},
  productsCache = [],
  productsLoading = false,
  companyId = null,
  displayMode = "default", // 'scanner' will render larger QR/barcode
}) {
  const [scanInput, setScanInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Stock-out dialog state
  const [outDialogOpen, setOutDialogOpen] = useState(false);
  const [outQty, setOutQty] = useState("");
  const [outReason, setOutReason] = useState("Sale");
  const [outLoading, setOutLoading] = useState(false);
  const outReasons = ["Sale", "Damaged", "Expired", "Transfer Out", "Other"];

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
      setError(err.response?.data?.message || "Product not found");
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
    if (!product || !Number(outQty) || Number(outQty) <= 0) return;
    setOutLoading(true);
    try {
      await stockOut({
        companyId: product.companyId || undefined,
        shopId: product.shopId || product.metadata?.shopId || undefined,
        userId: undefined, // Optional -- will be added by backend/session if needed
        productId: product._id || product.id,
        quantity: Number(outQty),
        reason: outReason,
      });
      setOutQty("");
      setOutReason("Sale");
      setError(null);
      alert("Stock out successful");
    } catch (err) {
      setError(err.response?.data?.message || "Stock out failed");
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
            Product Lookup
          </h3>
          <p className="text-sm text-gray-500">
            Search cached products or scan QR/Barcode
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
            placeholder="Search product name or SKU, or paste a barcode..."
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
                        Shop: {s.shopId || s.metadata?.shopId || "-"}
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
                Searching...
              </>
            ) : (
              <>
                <Search size={18} />
                Lookup Product
              </>
            )}
          </button>
          {(product || error) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Loading cached products indicator */}
      {productsLoading && (
        <div className="mt-4 text-sm text-gray-500">Loading products...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Product Found */}
      {product && (
        <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
          <div className="flex items-start gap-3 mb-3">
            <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium text-green-800">
              Product Selected
            </p>
          </div>

          <div className="flex items-center gap-4 p-3 bg-white rounded-lg border border-green-100">
            <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
              <Package size={24} className="text-orange-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-gray-900 truncate">
                {product.name || product.ProductName}
              </h4>
              <p className="text-sm text-gray-500">
                SKU:{" "}
                {product.identifiers?.sku ||
                  product.sku ||
                  product.SKU ||
                  "N/A"}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-sm text-gray-600">
                  Stock:{" "}
                  <strong className="text-gray-900">
                    {product.stock?.available ?? product.stock ?? 0}
                  </strong>
                </span>
                <span className="text-sm text-gray-600">
                  Shop:{" "}
                  <strong className="text-gray-900">
                    {product.shopId || product.metadata?.shopId || "-"}
                  </strong>
                </span>
              </div>

              {/* QR + Barcode */}
              <div className="flex items-center gap-4 mt-3">
                {product.codes?.qrPayload && (
                  <img
                    alt="QR"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=${
                      encodeURIComponent(product.codes.qrPayload)
                        ? displayMode === "scanner"
                          ? "400x400"
                          : "120x120"
                        : "120x120"
                    }&data=${encodeURIComponent(product.codes.qrPayload)}`}
                    className={`${
                      displayMode === "scanner" ? "w-56 h-56" : "w-24 h-24"
                    } bg-white p-1 rounded-md border object-contain`}
                  />
                )}
                {product.codes?.barcodePayload && (
                  <img
                    alt="Barcode"
                    src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(
                      product.codes.barcodePayload
                    )}&code=Code128&translate-esc=true`}
                    className={`${displayMode === "scanner" ? "h-28" : "h-14"}`}
                  />
                )}
              </div>

              {/* Stock Out Button opens a confirmation dialog */}
              <div className="mt-4">
                <button
                  onClick={() => setOutDialogOpen(true)}
                  className="w-full py-2.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Stock Out
                </button>

                <Dialog
                  open={outDialogOpen}
                  onClose={() => setOutDialogOpen(false)}
                >
                  <DialogTitle>Confirm Stock Out</DialogTitle>
                  <DialogContent>
                    <div className="space-y-3 mt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
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
                          Reason
                        </label>
                        <TextField
                          select
                          value={outReason}
                          onChange={(e) => setOutReason(e.target.value)}
                          fullWidth
                          size="small"
                        >
                          {outReasons.map((r) => (
                            <MenuItem key={r} value={r}>
                              {r}
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
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={async () => {
                        if (!Number(outQty) || Number(outQty) <= 0) {
                          setError("Please enter a quantity greater than 0");
                          return;
                        }
                        setOutLoading(true);
                        setError(null);
                        try {
                          await stockOut({
                            companyId: product.companyId || undefined,
                            shopId:
                              product.shopId ||
                              product.metadata?.shopId ||
                              undefined,
                            userId: undefined,
                            productId: product._id || product.id,
                            quantity: Number(outQty),
                            reason: outReason,
                          });
                          setOutQty("");
                          setOutReason("Sale");
                          setOutDialogOpen(false);
                          showSnackbar("Stock out successful", "success");
                          // Inform parent
                          onProductFound && onProductFound(product);
                        } catch (err) {
                          setError(
                            err.response?.data?.message || "Stock out failed"
                          );
                          showSnackbar(
                            err.response?.data?.message || "Stock out failed",
                            "error"
                          );
                        } finally {
                          setOutLoading(false);
                        }
                      }}
                    >
                      {outLoading ? "Processing..." : "Confirm"}
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
