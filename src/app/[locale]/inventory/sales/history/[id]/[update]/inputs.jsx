"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { TextField, CircularProgress } from "@mui/material";
import { updateSale } from "@/services/salesService";

const UpdateInputs = ({ saleData, saleId }) => {
  const [form, setForm] = useState({
    quantity: "",
    sellingPrice: "",
    discount: "",
    customerName: "",
    customerContact: "",
    soldDate: "",
    paymentMethod: "",
  });

  const [loading, setLoading] = useState(false);
  const t = useTranslations("updateProduct");
  const navigate = useRouter();
  const locale = useLocale();

  // Populate form with existing sale data
  useEffect(() => {
    if (saleData) {
      const item = saleData.items && saleData.items.length > 0 ? saleData.items[0] : {};
      const customer = saleData.knownUser || {};

      // Format date to YYYY-MM-DD for input type="date"
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setForm({
        productName: item.productName || "",
        productCategory: "N/A", // Not available in API
        quantity: item.quantity?.toString() || "",
        sellingPrice: item.unitPrice?.toString() || "",
        discount: item.discount?.toString() || "",
        customerName: customer.customerName || "",
        customerContact: customer.customerPhone || "",
        soldDate: formatDate(saleData.createdAt),
        paymentMethod: saleData.paymentMethod || "",
      });
    }
  }, [saleData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const validate = () => {
    const cleaned = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v.trim?.() || v])
    );
    const errors = [];

    if (!cleaned.productName) errors.push("Product name required");
    if (!cleaned.quantity || Number(cleaned.quantity) <= 0)
      errors.push("Quantity must be positive");
    if (!cleaned.sellingPrice || Number(cleaned.sellingPrice) <= 0)
      errors.push("Selling price must be positive");
    if (!cleaned.customerName) errors.push("Customer name required");
    if (!cleaned.soldDate) errors.push("Sold date required");

    return { ok: errors.length === 0, errors, cleaned };
  };

  const handleSubmit = async () => {
    const { ok, errors, cleaned } = validate();
    if (!ok) {
      alert("Fix errors:\n" + errors.join("\n"));
      return;
    }

    setLoading(true);

    try {
      // Prepare update payload matching API structure
      const updatePayload = {
        items: [
          {
            productName: cleaned.productName,
            quantity: Number(cleaned.quantity),
            unitPrice: Number(cleaned.sellingPrice),
            discount: Number(cleaned.discount) || 0,
          }
        ],
        knownUser: {
          customerName: cleaned.customerName,
          customerPhone: cleaned.customerContact,
        },
        paymentMethod: cleaned.paymentMethod,
        // Calculate totals
        subTotal: Number(cleaned.quantity) * Number(cleaned.sellingPrice),
        discountTotal: Number(cleaned.discount) || 0,
        totalAmount: (Number(cleaned.quantity) * Number(cleaned.sellingPrice)) - (Number(cleaned.discount) || 0),
      };

      await updateSale(saleId, updatePayload);
      alert("✅ Sale updated successfully!");

      // Redirect to sale detail page
      navigate.push(`/${locale}/inventory/sales/history/${saleId}`);
    } catch (error) {
      console.error("Update failed:", error);
      alert("❌ Failed to update sale: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center py-3">
      <div className="w-full max-w-4xl space-y-4">
        {/* Product Name + Category */}

        {/* Quantity + Selling Price */}
        <div className="flex gap-5">
          <TextField
            type="number"
            id="quantity"
            label="Quantity"
            value={form.quantity}
            onChange={handleChange}
            className="flex-1"
            variant="outlined"
          />
          <TextField
            type="number"
            id="sellingPrice"
            label="Selling Price"
            value={form.sellingPrice}
            onChange={handleChange}
            className="flex-1"
            variant="outlined"
          />
        </div>

        {/* Discount + Payment Method */}
        <div className="flex gap-5">
          <TextField
            type="number"
            id="discount"
            label="Discount"
            value={form.discount}
            onChange={handleChange}
            className="flex-1"
            variant="outlined"
          />
          <TextField
            type="text"
            id="paymentMethod"
            label="Payment Method"
            value={form.paymentMethod}
            onChange={handleChange}
            className="flex-1"
            variant="outlined"
          />
        </div>

        <h1 className="text-2xl font-bold text-center">
          {t("customerInformation")}
        </h1>

        {/* Customer Name + Contact */}
        <div className="flex gap-5">
          <TextField
            type="text"
            id="customerName"
            label="Customer Name"
            value={form.customerName}
            onChange={handleChange}
            className="flex-1"
            variant="outlined"
          />
          <TextField
            type="text"
            id="customerContact"
            label="Customer Contact"
            value={form.customerContact}
            onChange={handleChange}
            className="flex-1"
            variant="outlined"
          />
        </div>

        {/* Sold Date */}
        <div className="flex gap-5">
          <TextField
            type="date"
            id="soldDate"
            label="Sold Date"
            value={form.soldDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            className="flex-1"
            variant="outlined"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg transition flex items-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {loading && <CircularProgress size={20} color="inherit" />}
            {loading ? "Updating..." : t("updateButton")}
          </button>

          <button
            type="button"
            onClick={() => navigate.back()}
            disabled={loading}
            className="border border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3 rounded-lg transition"
          >
            {t("cancelButton")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateInputs;