"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
    //   const res = await axios.post("/api/update-sale", cleaned);
    //   alert("✅ Sent successfully!");
      console.log(cleaned);
    } catch {
      alert("❌ Failed to send data");
    }
  };

  const navigate = useRouter()

  return (
    <>
      <div className="flex ">
        <div className="space-y-5">
          <div className="space-x-5">
            <input
              type="text"
              id="productName"
              placeholder="product name"
              value={form.productName}
              onChange={handleChange}
              className="w-96 border-2 border-gray-300 p-2 rounded outline-none focus:outline-none focus:ring-0 "
            />
            <input
              type="text"
              id="productCategory"
              placeholder="category"
              value={form.productCategory}
              onChange={handleChange}
              className="w-96 border-2 border-gray-300 p-2 rounded outline-none focus:outline-none focus:ring-0 "
            />
          </div>

          <div className="space-x-5">
            <input
              type="number"
              id="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-96 border-2 border-gray-300 p-2 rounded outline-none focus:outline-none focus:ring-0 "
            />
            <input
              type="text"
              id="sellingPrice"
              placeholder="Selling Price"
              value={form.sellingPrice}
              onChange={handleChange}
              className="w-96 border-2 border-gray-300 p-2 rounded outline-none focus:outline-none focus:ring-0 "
            />
          </div>

          <div className="space-x-5">
            <input
              type="text"
              id="discount"
              placeholder="Discount"
              value={form.discount}
              onChange={handleChange}
              className="w-96 border-2 border-gray-300 p-2 rounded outline-none focus:outline-none focus:ring-0 "
            />
            <input
              type="text"
              id="productCategory"
              placeholder="category"
              value={form.productCategory}
              onChange={handleChange}
              className="w-96 border-2 border-gray-300 p-2 rounded outline-none focus:outline-none focus:ring-0 "
            />
          </div>

          <h1 className="text-xl font-bold text-center">Customer Information</h1>

          <div className="space-x-5">
            <input
              type="text"
              id="customerName"
              placeholder="Customer Name"
              value={form.customerName}
              onChange={handleChange}
              className="w-96 border-2 border-gray-300 p-2 rounded outline-none focus:outline-none focus:ring-0 "
            />
            <input
              type="text"
              id="customerContact"
              placeholder="Customer Contact"
              value={form.customerContact}
              onChange={handleChange}
              className="w-96 border-2 border-gray-300 p-2 rounded outline-none focus:outline-none focus:ring-0 "
            />
          </div>

          <div className="space-x-5">
            <input
              type="date"
              id="soldDate"
              placeholder="Sold Date"
              value={form.soldDate}
              onChange={handleChange}
              className="w-96 border-2 border-gray-300 p-2 rounded outline-none focus:outline-none focus:ring-0 "
            />
            <input
              type="text"
              id="paymentMethod"
              placeholder="Payment Method"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-96 border-2 border-gray-300 p-2 rounded outline-none focus:outline-none focus:ring-0 "
            />
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-orange-400 cursor-pointer text-white px-6 py-2 rounded">
              Update Sale
            </button>

            <button
              type="button"
              onClick={()=>{navigate.back()}}
              className="border-orange-400 border text-orange-400 cursor-pointer px-6 py-2 rounded">
              cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateInputs;
