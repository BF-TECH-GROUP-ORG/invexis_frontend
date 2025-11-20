"use client";
import { useState, useCallback, useEffect } from "react";
import { Button } from "../shared/button";
import SaleNotificationModal from "../shared/saleComfPop";
import jsPDF from "jspdf";
import { singleProductFetch, SellProduct } from "@/services/salesService";

const paymentMethods = ["cash", "card", "mobile", "wallet", "bank_transfer"];

const SellProductsInputs = ({ id }) => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [soldPrice, setSoldPrice] = useState("");
  const [quantitySold, setQuantitySold] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState(""); // New optional field
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(""); // Item-level discount
  const [printReceipt, setPrintReceipt] = useState(false);
  const [companyId, setCompanyId] = useState(""); // Fixed setter name

  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalMessage, setModalMessage504] = useState("");

  useEffect(() => {
    const getProduct = async () => {
      try {
        const product = await singleProductFetch(id);
        setProductName(product?.data?.name || "Unknown Product");
        setProductPrice(product?.data?.pricing?.salePrice || 0);
        setCompanyId(product?.data?.companyId || "");
      } catch (err) {
        console.error("Error fetching product:", err);
        setProductName("Unknown Product");
      }
    };
    if (id) getProduct();
  }, [id]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalMessage504("");
  }, []);

  const showModal = (type, message) => {
    setModalType(type);
    setModalMessage504(message);
    setIsModalOpen(true);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "soldPrice":
        const price = parseFloat(value);
        if (!value) error = "Sold price is required.";
        else if (isNaN(price) || price <= 0) error = "Sold price must be positive.";
        break;
      case "quantitySold":
        const qty = parseInt(value, 10);
        if (!value) error = "Quantity is required.";
        else if (isNaN(qty) || qty <= 0) error = "Quantity must be positive.";
        break;
      case "customerName":
        if (!value.trim()) error = "Customer name is required.";
        break;
      case "customerPhone":
        if (!value.trim()) error = "Phone is required.";
        else if (!/^[0-9+\-\s]{10,20}$/.test(value.trim())) error = "Invalid phone format.";
        break;
      case "discount":
        if (value && (isNaN(value) || parseFloat(value) < 0)) error = "Discount must be ≥ 0.";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const handleSubmit = async () => {
    const fields = { soldPrice, quantitySold, customerName, customerPhone };
    let valid = true;
    const newErrors = {};

    Object.entries(fields).forEach(([name, val]) => {
      const err = validateField(name, val);
      if (err) {
        valid = false;
        newErrors[name] = err;
      }
    });

    setErrors(newErrors);
    if (!valid) {
      showModal("error", "Please fix the errors above.");
      return;
    }

    const unitPrice = parseFloat(soldPrice);
    const quantity = parseInt(quantitySold, 10);
    const itemDiscount = parseFloat(discount) || 0;

    const subtotal = unitPrice * quantity;
    const totalAfterDiscount = subtotal - itemDiscount;

    // EXACT PAYLOAD YOUR BACKEND EXPECTS
    const payload = {
      companyId: companyId,
      customerId: "", // optional, can be generated on backend
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim() || null, // optional
      customerPhone: customerPhone.trim(),
      items: [
        {
          productId: id,
          productName: productName,
          quantity: quantity,
          unitPrice: unitPrice,
          discount: itemDiscount // discount per item/line
        }
      ],
      paymentMethod: paymentMethod, // matches your options: cash, wallet, etc.
      // totalAmount not needed if backend calculates it
    };

    console.log("Sending payload:", payload); // For debugging

    try {
      await SellProduct(payload); // Now matches backend exactly

      if (printReceipt) {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Sales Receipt", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.text(`Customer: ${customerName}`, 20, 40);
        doc.text(`Phone: ${customerPhone}`, 20, 50);
        doc.text(`Product: ${productName}`, 20, 60);
        doc.text(`Qty: ${quantity} × $${unitPrice.toFixed(2)}`, 20, 70);
        doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, 80);
        if (itemDiscount > 0) doc.text(`Discount: -$${itemDiscount.toFixed(2)}`, 20, 90);
        doc.text(`Total: $${totalAfterDiscount.toFixed(2)}`, 20, itemDiscount > 0 ? 100 : 90);
        doc.text(`Payment: ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1).replace("_", " ")}`, 20, itemDiscount > 0 ? 110 : 100);
        doc.text("Thank you!", 105, itemDiscount > 0 ? 130 : 120, { align: "center" });

        const pdfUrl = doc.output("bloburl");
        const win = window.open(pdfUrl);
        if (win) win.onload = () => win.print();
      }

      showModal("success", "Sale recorded successfully!");
      // Reset form
      setSoldPrice("");
      setQuantitySold("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setDiscount("");
      setPaymentMethod("cash");
      setPrintReceipt(false);
      setErrors({});
    } catch (err) {
      console.error("Sale failed:", err);
      showModal("error", "Failed to record sale. Please try again.");
    }
  };

  const inputClass = "w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-orange-400 focus:border-orange-400 transition";
  const selectClass = "w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-orange-400 focus:border-orange-400 bg-white";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 font-sans">
      <div className="w-full max-w-lg space-y-8 rounded-2xl bg-white p-10 shadow-xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">
            Stock-Out <span className="text-orange-500">{productName}</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Standard Price: ${parseFloat(productPrice || 0).toFixed(2)}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Sold Price <span className="text-red-500">*</span></label>
            <input type="number" step="0.01" placeholder="e.g. 99.99" value={soldPrice} onChange={(e) => setSoldPrice(e.target.value)} onBlur={(e) => validateField("soldPrice", e.target.value)} className={inputClass} />
            {errors.soldPrice && <p className="mt-1 text-xs text-red-500">{errors.soldPrice}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity Sold <span className="text-red-500">*</span></label>
            <input type="number" placeholder="e.g. 2" value={quantitySold} onChange={(e) => setQuantitySold(e.target.value)} onBlur={(e) => validateField("quantitySold", e.target.value)} className={inputClass} />
            {errors.quantitySold && <p className="mt-1 text-xs text-red-500">{errors.quantitySold}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Discount (optional)</label>
            <input type="number" step="0.01" min="0" placeholder="0.00" value={discount} onChange={(e) => setDiscount(e.target.value)} onBlur={(e) => validateField("discount", e.target.value)} className={inputClass} />
            {errors.discount && <p className="mt-1 text-xs text-red-500">{errors.discount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method <span className="text-red-500">*</span></label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={selectClass}>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method.charAt(0).toUpperCase() + method.slice(1).replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name <span className="text-red-500">*</span></label>
            <input type="text" placeholder="John Doe" value={customerName} onChange={(e) => setCustomerName(e.target.value)} onBlur={(e) => validateField("customerName", e.target.value)} className={inputClass} />
            {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Phone <span className="text-red-500">*</span></label>
            <input type="tel" placeholder="+250788123456" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} onBlur={(e) => validateField("customerPhone", e.target.value)} className={inputClass} />
            {errors.customerPhone && <p className="mt-1 text-xs text-red-500">{errors.customerPhone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Email (optional)</label>
            <input type="email" placeholder="john@example.com" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className={inputClass} />
          </div>

          <div className="flex items-center space-x-3">
            <input type="checkbox" id="printReceipt" checked={printReceipt} onChange={(e) => setPrintReceipt(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-orange-500" />
            <label htmlFor="printReceipt" className="text-sm font-medium text-gray-700 cursor-pointer">Print receipt after sale</label>
          </div>

          <div className="flex space-x-4 pt-6">
            <Button type="button" onClick={() => window.history.back()} className="flex-1 bg-gray-200 py-3 text-gray-700 hover:bg-gray-300">
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} className="flex-1 bg-orange-500 py-3 text-white hover:bg-orange-600">
              Confirm Sale
            </Button>
          </div>
        </div>

        <SaleNotificationModal isOpen={isModalOpen} onClose={closeModal} type={modalType}  />
      </div>
    </div>
  );
};

export default SellProductsInputs;