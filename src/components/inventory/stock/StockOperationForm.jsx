// src/components/inventory/stock/StockOperationForm.jsx
"use client";

import React, { useState, useEffect } from "react";
import { ArrowDownCircle, Package, Loader2, X } from "lucide-react";
import { bulkStockIn } from "@/services/stockService";
import useAuth from "@/hooks/useAuth";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useTranslations } from "next-intl";

export default function StockOperationForm({
  product = null,
  onSuccess = () => { },
  companyId,
  productsCache = [],
}) {
  const t = useTranslations("stockManagement.operations");
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Batch state - products added for bulk in
  const [batchItems, setBatchItems] = useState([]);

  // When product prop changes, populate the form (but do not auto-add to batch)
  useEffect(() => {
    if (!product) {
      setQuantity("");
      return;
    }
    // Default quantity empty so user must set it to add
    setQuantity("");
  }, [product]);

  const addToBatch = () => {
    if (!product || !Number(quantity) || Number(quantity) <= 0) {
      setMessage({
        type: "error",
        text: t("errors.selectProduct"),
      });
      return;
    }
    const item = {
      productId: product._id || product.id,
      productName: product.name || product.ProductName,
      shopId: product.shopId || product.metadata?.shopId || undefined,
      quantity: Number(quantity),
    };

    setBatchItems((prev) => {
      // replace if exists else add
      const exists = prev.findIndex((p) => p.productId === item.productId);
      if (exists !== -1) {
        const copy = [...prev];
        copy[exists] = item;
        return copy;
      }
      return [item, ...prev];
    });

    // Clear form after adding
    setQuantity("");
    setMessage({ type: "success", text: t("errors.addedToBatch", { name: item.productName }) });
  };

  const removeFromBatch = (productId) => {
    setBatchItems((prev) => prev.filter((p) => p.productId !== productId));
  };

  const loadBatchItem = (item) => {
    // load item into form for editing
    const p =
      productsCache.find((pp) => (pp._id || pp.id) === item.productId) || {};
    // set selected product context not changed here; just populate fields
    setQuantity(String(item.quantity));
  };

  const handleSubmitBatch = async (e) => {
    e.preventDefault();

    // If there are no batch items but current form has a selected product + quantity, treat it as a single-item batch
    let itemsToSubmit = batchItems;
    if (itemsToSubmit.length === 0) {
      if (!product || !Number(quantity) || Number(quantity) <= 0)
        return setMessage({
          type: "error",
          text: t("errors.noBatchItems"),
        });

      itemsToSubmit = [
        {
          productId: product._id || product.id,
          productName: product.name || product.ProductName,
          shopId: product.shopId || product.metadata?.shopId || undefined,
          quantity: Number(quantity),
        },
      ];
    }

    // Group by shopId (items without shopId go under key '__no_shop__')
    const groups = itemsToSubmit.reduce((acc, it) => {
      const key = it.shopId || "__no_shop__";
      acc[key] = acc[key] || [];
      acc[key].push(it);
      return acc;
    }, {});

    setLoading(true);
    setMessage(null);

    const results = [];

    try {
      for (const [shopKey, items] of Object.entries(groups)) {
        const payload = {
          companyId: companyId,
          shopId: shopKey === "__no_shop__" ? undefined : shopKey,
          userId: user?.id || user?.sub || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        };

        try {
          await bulkStockIn(payload);
          results.push({
            shop: payload.shopId || "-",
            count: items.length,
            ok: true,
          });
        } catch (err) {
          results.push({
            shop: payload.shopId || "-",
            count: items.length,
            ok: false,
            error: err.response?.data?.message || err.message,
          });
        }
      }

      const successCount = results.filter((r) => r.ok).length;
      const failed = results.filter((r) => !r.ok);

      if (failed.length === 0) {
        showSnackbar(
          t("errors.bulkSuccess", { count: successCount }),
          "success"
        );
        setMessage({
          type: "success",
          text: t("errors.bulkSuccess", { count: successCount }),
        });
        setBatchItems([]);
        setQuantity("");
        onSuccess();
      } else {
        const firstErr = failed[0];
        showSnackbar(t("errors.bulkPartial", { error: firstErr.error }), "error");
        setMessage({
          type: "error",
          text: t("errors.bulkPartial", { error: firstErr.error }),
        });
      }
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || t("errors.bulkFailed"),
        "error"
      );
      setMessage({
        type: "error",
        text: err.response?.data?.message || t("errors.bulkFailed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
          <Package size={20} className="text-orange-600" />
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

      {/* Batch chips */}
      {batchItems.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {batchItems.map((b) => (
              <div
                key={b.productId}
                className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 flex items-center gap-2 text-sm"
              >
                <button
                  onClick={() => loadBatchItem(b)}
                  className="font-medium text-gray-800"
                >
                  {b.productName}
                </button>
                <button
                  onClick={() => removeFromBatch(b.productId)}
                  className="p-1 rounded-full hover:bg-gray-200"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Product */}
      {product ? (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
          <p className="text-sm text-gray-500">{t("selectedProduct")}</p>
          <p className="font-medium text-gray-900">
            {product.name || product.ProductName}
          </p>
          <p className="text-xs text-gray-500">
            {t("currentStock")}:{" "}
            {product.inventory?.quantity ??
              product.stock?.available ??
              product.stock?.total ??
              product.stock ??
              0}
          </p>
        </div>
      ) : (
        <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg mb-4 text-center">
          <p className="text-sm text-orange-700">
            {t("noProductSelected")}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmitBatch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("qtyLabel")}
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder={t("qtyPlaceholder")}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
              }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={addToBatch}
            disabled={!product || !Number(quantity) || Number(quantity) <= 0}
            className={`flex-1 py-2.5 ${!product || !Number(quantity) || Number(quantity) <= 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
              } text-white rounded-lg transition-colors`}
          >
            Add to Batch
          </button>
          <button
            type="submit"
            disabled={
              loading ||
              (batchItems.length === 0 &&
                (!product || !Number(quantity) || Number(quantity) <= 0))
            }
            className={`flex-1 py-2.5 ${loading ||
                (batchItems.length === 0 &&
                  (!product || !Number(quantity) || Number(quantity) <= 0))
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
              } text-white rounded-lg transition-colors`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {t("processing")}
              </>
            ) : (
              t("submitBatch")
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
