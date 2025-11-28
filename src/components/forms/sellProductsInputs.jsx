"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "../shared/button";
import SaleNotificationModal from "../shared/saleComfPop";
import jsPDF from "jspdf";
import { singleProductFetch, SellProduct } from "@/services/salesService";

const paymentMethods = ["cash", "card", "mobile", "wallet", "bank_transfer"];

const   SellProductsInputs = ({ id }) => {
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [soldPrice, setSoldPrice] = useState("");
  const [quantitySold, setQuantitySold] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(""); // Item-level discount
  const [printReceipt, setPrintReceipt] = useState(false);
  const [isDebt, setIsDebt] = useState(false); // Toggle for debt/regular sale

  // Required by your backend
  const [companyId, setCompanyId] = useState("");
  const [shopId, setShopId] = useState("");
  const [soldBy, setSoldBy] = useState("691d8f766fb4aca9a9fa618d"); // Logged-in user ID or email

  const [errors, setErrors] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const locale = useLocale();

  // Fetch product + user/shop info
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fetch product
        const product = await singleProductFetch(id);
        setProductName(product?.data?.name || "Unknown Product");
        setProductPrice(product?.data?.pricing?.salePrice || 0);
        setCompanyId(product?.data?.companyId || "");

        // 2. Get logged-in user & shop from localStorage (adjust key names if needed)
        // 2. Get logged-in user & shop from localStorage (adjust key names if needed)
        // HARDCODED FOR TESTING AS REQUESTED
        const TEST_ID = "691d8f766fb4aca9a9fa619b";

        setSoldBy(TEST_ID);
        setShopId(TEST_ID);
        // Fallback for companyId if not in product
        if (!product?.data?.companyId) {
          setCompanyId(TEST_ID);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setProductName("Unknown Product");
      }
    };

    if (id) loadData();
  }, [id]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalMessage("");
    if (modalType === "success") {
      router.push(`/${locale}/inventory/sales`);
    }
  }, [modalType, router, locale]);

  const showModal = (type, message) => {
    setModalType(type);
    setModalMessage(message);
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
    setLoading(true);
    const fields = { soldPrice, quantitySold, customerName, customerPhone };
    console.log(fields)
    let valid = true;
    const newErrors = {};

    Object.entries(fields).forEach(([name, val]) => {
      const err = validateField(name, val);
      if (err) {
        valid = false;
        newErrors[name] = err;
      }
    });

    // Extra validation for required backend fields
    // if (!companyId || !shopId || !soldBy) {
    //   showModal("error", "Missing shop or user data. Please log in again.");
    //   setLoading(false);
    //   return;
    // }

    setErrors(newErrors);
    if (!valid) {
      showModal("error", "Please fix the errors above.");
      setLoading(false);
      return;
    }

    const unitPrice = parseFloat(soldPrice);
    const quantity = parseInt(quantitySold, 10);
    const itemDiscount = parseFloat(discount) || 0;

    const subtotal = unitPrice * quantity;

    if (itemDiscount > subtotal) {
      showModal("error", "Discount cannot be greater than the subtotal.");
      setLoading(false);
      return;
    }

    const totalAfterDiscount = subtotal - itemDiscount;

    // HARDCODED FOR TESTING AS REQUESTED
    // Ensure these are never empty even if state fails
    const TEST_UUID = "a6e0c5ff-8665-449d-9864-612ab1c9b9f2"; // Valid UUIDv4
    const TEST_MONGO_ID = "691d8f766fb4aca9a9fa619b"; // Valid MongoDB ObjectId

    const finalCompanyId = companyId || TEST_UUID;
    const finalShopId = shopId || TEST_UUID;
    const finalSoldBy = soldBy || TEST_MONGO_ID;

    // FINAL PAYLOAD THAT WORKS (tested against 400 errors)
    const payload = {
      companyId: finalCompanyId,
      shopId: finalShopId,
      soldBy: finalSoldBy,

      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || null,

      items: [
        {
          productId: id,
          productName,
          quantity,
          unitPrice,
          discount: itemDiscount,
          totalPrice: totalAfterDiscount, // ← CRITICAL FIELD
        }
      ],

      paymentMethod,
      paymentId: Date.now().toString(), // Added as requested
      totalAmount: totalAfterDiscount,
      discountAmount: itemDiscount,
    };

    console.log("Sending sale payload:", payload);

    try {
      await SellProduct(payload, isDebt); // Pass isDebt flag to service

      // Print receipt if checked
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
        if (win) win.print();
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
      const msg = err.response?.data?.message || err.message || "Failed to record sale.";
      showModal("error", msg);
    } finally {
      setLoading(false);
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
            <label className="block text-sm font-medium697 text-gray-700">Discount (optional)</label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setIsDebt(!isDebt)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${isDebt ? 'bg-orange-500' : 'bg-gray-300'
                  }`}
                role="switch"
                aria-checked={isDebt}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${isDebt ? 'translate-x-8' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {isDebt ? (
                  <span className="flex items-center space-x-2">
                    <span className="text-orange-600">💳 Debt Sale</span>
                    <span className="text-xs text-gray-500">(Payment pending)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span className="text-green-600">✅ Regular Sale</span>
                    <span className="text-xs text-gray-500">(Paid in full)</span>
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input type="checkbox" id="printReceipt" checked={printReceipt} onChange={(e) => setPrintReceipt(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-orange-500" />
            <label htmlFor="printReceipt" className="text-sm font-medium text-gray-700 cursor-pointer">Print receipt after sale</label>
          </div>

          <div className="flex space-x-4 pt-6">
            <Button type="button" onClick={() => window.history.back()} className="flex-1 bg-gray-200 py-3 text-gray-700 hover:bg-gray-300">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 bg-orange-500 py-3 text-white hover:bg-orange-600 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Confirm Sale"
              )}
            </Button>
          </div>
        </div>

        <SaleNotificationModal
          isOpen={isModalOpen}
          onClose={closeModal}
          type={modalType}
          message={modalMessage}
        />
      </div>
    </div>
  );
};

export default SellProductsInputs;