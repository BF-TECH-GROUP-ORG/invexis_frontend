"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "../shared/button";
import SaleNotificationModal from "../shared/saleComfPop";
import jsPDF from "jspdf";
import { singleProductFetch, SellProduct } from "@/services/salesService";
import PaymentMethodSelector from "./PaymentMethodSelector";
import { SALES_PAYMENT_METHODS } from "@/constants/paymentMethods";

const paymentMethods = Object.keys(SALES_PAYMENT_METHODS);

import { useSession } from "next-auth/react";

const SellProductsInputs = ({ id }) => {
  const { data: session } = useSession();
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [soldPrice, setSoldPrice] = useState("");
  const [quantitySold, setQuantitySold] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [discount, setDiscount] = useState(""); // Item-level discount
  const [printReceipt, setPrintReceipt] = useState(false);
  const [isDebt, setIsDebt] = useState(false); // Toggle for debt/regular sale

  // Required by your backend
  const [companyId, setCompanyId] = useState("");
  const [shopId, setShopId] = useState("");
  const [soldBy, setSoldBy] = useState("");

  const t = useTranslations('sellProduct');
  const tSingle = useTranslations('sellProduct.single');
  const tCustomer = useTranslations('sellProduct.modals.customer');
  const tSuccess = useTranslations('sellProduct.modals.success');

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

        // Use session data
        if (session?.user) {
          setSoldBy(session.user._id);
          setShopId(session.user.shops?.[0] || "");
          const companyObj = session.user.companies?.[0];
          setCompanyId(typeof companyObj === 'string' ? companyObj : (companyObj?.id || companyObj?._id || ""));
        }

      } catch (err) {
        console.error("Error loading data:", err);
        setProductName("Unknown Product");
      }
    };

    if (id && session) loadData();
  }, [id, session]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalMessage("");
    if (modalType === "success") {
      router.push(`/${locale}/inventory/sales/history`);
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
        if (!value) error = tSingle('errors.soldPriceRequired');
        else if (isNaN(price) || price <= 0) error = tSingle('errors.soldPricePositive');
        break;
      case "quantitySold":
        const qty = parseInt(value, 10);
        if (!value) error = tSingle('errors.quantityRequired');
        else if (isNaN(qty) || qty <= 0) error = tSingle('errors.quantityPositive');
        break;
      case "customerName":
        if (!value.trim()) error = tCustomer('errors.nameRequired');
        break;
      case "customerPhone":
        if (!value.trim()) error = tCustomer('errors.phoneRequired');
        else if (!/^[0-9+\-\s]{10,20}$/.test(value.trim())) error = tCustomer('errors.phoneInvalid');
        break;
      case "discount":
        if (value && (isNaN(value) || parseFloat(value) < 0)) error = tSingle('errors.discountInvalid');
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

    // Validate payment phone for mobile methods
    if (["mtn", "airtel", "mpesa"].includes(paymentMethod)) {
      if (!paymentPhone || paymentPhone.length < 10) {
        valid = false;
        newErrors.paymentPhone = tSingle('errors.paymentPhoneRequired');
      }
    }

    // Extra validation for required backend fields
    // if (!companyId || !shopId || !soldBy) {
    //   showModal("error", "Missing shop or user data. Please log in again.");
    //   setLoading(false);
    //   return;
    // }

    setErrors(newErrors);
    if (!valid) {
      showModal("error", tSingle('errors.fixErrors'));
      setLoading(false);
      return;
    }

    const unitPrice = parseFloat(soldPrice);
    const quantity = parseInt(quantitySold, 10);
    const itemDiscount = parseFloat(discount) || 0;

    const subtotal = unitPrice * quantity;

    if (itemDiscount > subtotal) {
      showModal("error", tSingle('errors.discountExceeds'));
      setLoading(false);
      return;
    }

    const totalAfterDiscount = subtotal - itemDiscount;

    const finalCompanyId = companyId;
    const finalShopId = shopId;
    const finalSoldBy = soldBy;

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
      paymentPhoneNumber: (["mtn", "airtel", "mpesa"].includes(paymentMethod) && paymentPhone) ? paymentPhone : undefined,
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
        doc.text(tSingle('receipt.title'), 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`${tSingle('receipt.date')}: ${new Date().toLocaleDateString(locale)}`, 20, 30);
        doc.text(`${tSingle('receipt.customer')}: ${customerName}`, 20, 40);
        doc.text(`${tSingle('receipt.phone')}: ${customerPhone}`, 20, 50);
        doc.text(`${tSingle('receipt.product')}: ${productName}`, 20, 60);
        doc.text(`${tSingle('receipt.qty')}: ${quantity} × ${new Intl.NumberFormat(locale).format(unitPrice)} FRW`, 20, 70);
        doc.text(`${tSingle('receipt.subtotal')}: ${new Intl.NumberFormat(locale).format(subtotal)} FRW`, 20, 80);
        if (itemDiscount > 0) doc.text(`${tSingle('receipt.discount')}: -${new Intl.NumberFormat(locale).format(itemDiscount)} FRW`, 20, 90);
        doc.text(`${tSingle('receipt.total')}: ${new Intl.NumberFormat(locale).format(totalAfterDiscount)} FRW`, 20, itemDiscount > 0 ? 100 : 90);
        const methodLabel = tCustomer(paymentMethod);
        doc.text(`${tSingle('receipt.payment')}: ${methodLabel}`, 20, itemDiscount > 0 ? 110 : 100);
        if (["mtn", "airtel", "mpesa"].includes(paymentMethod) && paymentPhone) {
          doc.text(`${tSingle('receipt.paymentPhone')}: ${paymentPhone}`, 20, itemDiscount > 0 ? 120 : 110);
        }
        doc.text(tSingle('receipt.thankYou'), 105, itemDiscount > 0 ? 140 : 130, { align: "center" });

        const pdfUrl = doc.output("bloburl");
        const win = window.open(pdfUrl);
        if (win) win.print();
      }

      showModal("success", tSuccess('recorded'));

      // Reset form
      setSoldPrice("");
      setQuantitySold("");
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setDiscount("");
      setPaymentMethod("cash");
      setPaymentPhone("");
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
            {tSingle.rich('title', {
              name: productName,
              span: (chunks) => <span className="text-orange-500">{chunks}</span>
            })}
          </h1>
          <p className="mt-2 text-gray-600">
            {tSingle('standardPrice')}: {new Intl.NumberFormat(locale, { style: 'currency', currency: 'RWF' }).format(productPrice)}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">{tSingle('soldPrice')} <span className="text-red-500">*</span></label>
            <input type="number" step="0.01" placeholder={tSingle('placeholders.price')} value={soldPrice} onChange={(e) => setSoldPrice(e.target.value)} onBlur={(e) => validateField("soldPrice", e.target.value)} className={inputClass} />
            {errors.soldPrice && <p className="mt-1 text-xs text-red-500">{errors.soldPrice}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{tSingle('quantitySold')} <span className="text-red-500">*</span></label>
            <input type="number" placeholder={tSingle('placeholders.quantity')} value={quantitySold} onChange={(e) => setQuantitySold(e.target.value)} onBlur={(e) => validateField("quantitySold", e.target.value)} className={inputClass} />
            {errors.quantitySold && <p className="mt-1 text-xs text-red-500">{errors.quantitySold}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium697 text-gray-700">{tSingle('discount')}</label>
            <input type="number" step="0.01" min="0" placeholder={tSingle('placeholders.discount')} value={discount} onChange={(e) => setDiscount(e.target.value)} onBlur={(e) => validateField("discount", e.target.value)} className={inputClass} />
            {errors.discount && <p className="mt-1 text-xs text-red-500">{errors.discount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">{tCustomer('paymentMethod')} <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-5 gap-2">
              {paymentMethods.map((method) => {
                const methodConfig = SALES_PAYMENT_METHODS[method];
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 ${paymentMethod === method
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 bg-white hover:border-orange-400"
                      }`}
                  >
                    {methodConfig.image ? (
                      <img
                        src={methodConfig.image}
                        alt={tCustomer(method)}
                        className={`h-6 w-auto object-contain mb-1 transition-all duration-200 ${paymentMethod === method ? "opacity-100" : "opacity-60"
                          }`}
                        style={{
                          filter: paymentMethod === method ? "none" : "grayscale(100%)"
                        }}
                      />
                    ) : (
                      <span className="text-lg mb-1">{methodConfig.icon}</span>
                    )}
                    <span
                      className={`text-xs font-semibold text-center transition-colors duration-200 ${paymentMethod === method
                        ? "text-orange-700"
                        : "text-gray-600"
                        }`}
                    >
                      {tCustomer(method)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Conditional Phone Input for Mobile Payments */}
            {["mtn", "airtel", "mpesa"].includes(paymentMethod) && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {tSingle('paymentPhoneLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder={tCustomer('phonePlaceholder')}
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  className={`${inputClass} ${paymentPhone && paymentPhone.length < 10
                    ? "border-red-500 focus:ring-red-400"
                    : ""
                    }`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {tSingle('paymentPhoneInfo', { method: tCustomer(paymentMethod) })}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{tCustomer('nameLabel')} <span className="text-red-500">*</span></label>
            <input type="text" placeholder={tCustomer('namePlaceholder')} value={customerName} onChange={(e) => setCustomerName(e.target.value)} onBlur={(e) => validateField("customerName", e.target.value)} className={inputClass} />
            {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{tCustomer('phoneLabel')} <span className="text-red-500">*</span></label>
            <input type="tel" placeholder={tCustomer('phonePlaceholder')} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} onBlur={(e) => validateField("customerPhone", e.target.value)} className={inputClass} />
            {errors.customerPhone && <p className="mt-1 text-xs text-red-500">{errors.customerPhone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{tSingle('customerEmail')}</label>
            <input type="email" placeholder={tSingle('placeholders.email')} value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{tSingle('transactionType')}</label>
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
                    <span className="text-orange-600">{tCustomer('statusDebt')}</span>
                    <span className="text-xs text-gray-500">({tCustomer('statusPaid') === "statusPaid" ? "Payment pending" : tCustomer('statusPaid')})</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-2">
                    <span className="text-green-600">{tSingle('regularSale')}</span>
                    <span className="text-xs text-gray-500">({tCustomer('statusPaid')})</span>
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input type="checkbox" id="printReceipt" checked={printReceipt} onChange={(e) => setPrintReceipt(e.target.checked)} className="h-5 w-5 rounded border-gray-300 text-orange-500" />
            <label htmlFor="printReceipt" className="text-sm font-medium text-gray-700 cursor-pointer">{tSingle('printReceipt')}</label>
          </div>

          <div className="flex space-x-4 pt-6">
            <Button type="button" onClick={() => window.history.back()} className="flex-1 bg-gray-200 py-3 text-gray-700 hover:bg-gray-300">
              {t('actions.cancel')}
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
                  {t('actions.processing')}
                </span>
              ) : (
                tSingle('confirmSale')
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