"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TextField } from "@mui/material";

const UpdateInputs = () => {
  const [form, setForm] = useState({
    productName: "",
    productCategory: "",
    quantity: "",
    sellingPrice: "",
    discount: "",
    customerName: "",
    customerContact: "",
    soldDate: "",
    paymentMethod: "",
  });

  const t = useTranslations("updateProduct");

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
    if (!cleaned.productCategory) errors.push("Category required");
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

    try {
      // const res = await axios.post("/api/update-sale", cleaned);
      // alert("✅ Sent successfully!");
      console.log(cleaned);
    } catch {
      alert("❌ Failed to send data");
    }
  };

  const navigate = useRouter();

  return (
    <div className="flex justify-center py-3">
      <div className="w-full max-w-4xl space-y-4"> {/* Main vertical spacing */}

        {/* Product Name + Category */}
        <div className="flex gap-5">
          <TextField
            type="text"
            id="productName"
            label="Product Name"
            value={form.productName}
            onChange={handleChange}
            className="flex-1"
            variant="outlined"
          />
          <TextField
            type="text"
            id="productCategory"
            label="Category"
            value={form.productCategory}
            onChange={handleChange}
            className="flex-1"
            variant="outlined"
          />
        </div>

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

        {/* Discount + (fixed duplicate field) */}
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
          {/* You had a duplicate productCategory field here – replace with whatever you need */}
          <TextField
            type="text"
            label="Additional Field (optional)"
            placeholder="e.g., Notes"
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

        {/* Sold Date + Payment Method */}
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

        {/* Buttons */}
        <div className="flex justify-between pt-5">
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg transition"
          >
            {t("updateButton")}
          </button>

          <button
            type="button"
            onClick={() => navigate.back()}
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