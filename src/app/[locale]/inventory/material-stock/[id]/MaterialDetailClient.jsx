"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById, deleteProduct } from "@/features/products/productsSlice";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  AlertCircle,
  QrCode,
  Layout,
  Tag,
  History,
  Info,
  Layers,
  FileText,
  Warehouse
} from "lucide-react";
import shopService from "@/services/shopService";
import ConfirmModal from "@/components/shared/ConfirmModal";

function Field({ label, value, icon: Icon }) {
  const display = (value === undefined || value === null || value === "") ? "N/A" : value;

  return (
    <div className="group">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
        {Icon && <Icon size={12} className="text-gray-300 group-hover:text-orange-400 transition-colors" />}
        {label}
      </label>
      <div className="font-bold text-gray-900 border-b border-gray-50 pb-2 group-hover:border-orange-100 transition-colors">
        {display}
      </div>
    </div>
  );
}

export default function MaterialDetailClient({ id }) {
  const t = useTranslations("materials.detail");
  const commonT = useTranslations("common");
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const product = useSelector((s) => s.products.selectedProduct);
  const loading = useSelector((s) => s.products.loading);
  
  const [activeTab, setActiveTab] = useState("overview");
  const [resolvedShopName, setResolvedShopName] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    const resolveShop = async () => {
      if (!product?.shopId) return;
      try {
        const companyId = session?.user?.companies?.[0] || session?.user?.companyId;
        const shopRes = await shopService.getShopById(product.shopId, companyId);
        setResolvedShopName(shopRes?.name || shopRes?.data?.name || "Inventory Shop");
      } catch (error) {
        setResolvedShopName("Inventory Shop");
      }
    };
    resolveShop();
  }, [product, session]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteProduct(product._id || product.id)).unwrap();
      toast.success("Asset deleted successfully");
      router.push(pathname.replace(/\/[^/]+$/, ""));
    } catch (err) {
      toast.error("Failed to delete asset");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black/10 border-t-black rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t("loading")}</p>
        </div>
      </div>
    );
  }

  const stock = product.shopInventory?.quantity ?? product.stock ?? 0;
  const threshold = product.shopInventory?.lowStockThreshold ?? 10;
  const isLowStock = stock > 0 && stock <= threshold;
  const isOutOfStock = stock <= 0;

  const tabs = [
    { id: "overview", label: t("overview"), icon: Layout },
    { id: "specs", label: t("specifications"), icon: FileText },
    { id: "history", label: t("movementHistory"), icon: History },
  ];

  return (
    <div className="max-w-[1400px] mx-auto pt-6 px-4 pb-20">
      {/* Header Section */}
      <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-8 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-6 items-start">
            <button
               onClick={() => router.back()}
               className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-black transition-all"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                  MATERIAL ASSET
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-200">
                  {product.sku || product.identifiers?.sku || "NO-SKU"}
                </span>
              </div>
              <h1 className="text-4xl font-black text-[#081422] tracking-tight mb-2">
                {product.name}
              </h1>
              <p className="text-gray-400 font-medium flex items-center gap-2">
                <Warehouse size={16} /> {resolvedShopName} • {product.category?.name || "Uncategorized"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => router.push(`/inventory/products/${id}/edit?type=material`)}
              className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 hover:border-black text-black font-extrabold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Edit size={18} /> {commonT("edit")}
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 font-extrabold rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={18} /> {commonT("delete")}
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-t border-gray-50">
           <div className="p-8 border-r border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{t("currentQuantity")}</p>
                <p className={`text-3xl font-black ${isOutOfStock ? "text-red-600" : isLowStock ? "text-orange-600" : "text-black"}`}>
                  {stock.toLocaleString()} <span className="text-sm font-bold text-gray-400 uppercase ml-1">Units</span>
                </p>
              </div>
              <div className={`p-4 rounded-2xl ${isOutOfStock ? "bg-red-50 text-red-600" : isLowStock ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}`}>
                <Package size={24} />
              </div>
           </div>
           <div className="p-8 border-r border-gray-50 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Stock Status</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-red-500 animate-pulse" : isLowStock ? "bg-orange-500" : "bg-emerald-500"}`} />
                  <p className="text-lg font-black uppercase tracking-wider">
                    {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock Alert" : "Good Standing"}
                  </p>
                </div>
              </div>
           </div>
           <div className="p-8 flex items-center justify-between bg-gray-50/30">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Threshold</p>
                <p className="text-xl font-bold text-gray-600">
                  {threshold} <span className="text-xs font-medium text-gray-400 ml-1 uppercase">Warning Level</span>
                </p>
              </div>
              <AlertCircle size={24} className="text-gray-300" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar Tabs */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-white rounded-4xl border border-gray-100 shadow-sm p-4 space-y-2 sticky top-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === tab.id 
                    ? "bg-[#081422] text-white shadow-xl shadow-gray-200" 
                    : "text-gray-400 hover:text-black hover:bg-gray-50"
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Basic Information */}
                <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                    <span className="w-1 h-6 bg-orange-500 rounded-full" />
                    Asset Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12">
                    <Field label={t("assetName")} value={product.name} icon={Tag} />
                    <Field label={t("category")} value={product.category?.name} icon={Layers} />
                    <Field label={t("shop")} value={resolvedShopName} icon={Warehouse} />
                    <Field label={t("sku")} value={product.sku || product.identifiers?.sku} icon={Info} />
                    <Field label={t("barcode")} value={product.identifiers?.barcode} icon={QrCode} />
                    <Field label={t("assetId")} value={product.identifiers?.scanId} icon={Info} />
                    <Field label={t("brandOrigin")} value={product.brand || product.manufacturer} icon={Tag} />
                    <Field label={t("currentQuantity")} value={`${stock} Units`} icon={Package} />
                    <Field label={t("registeredDate")} value={product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "N/A"} icon={History} />
                  </div>
                </section>

                {/* Description */}
                <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                    <span className="w-1 h-6 bg-blue-500 rounded-full" />
                    {t("internalDescription")}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {product.description?.short || product.description || "No specific description provided for this internal asset."}
                  </p>
                </section>
              </motion.div>
            )}

            {activeTab === "specs" && (
                <motion.div
                  key="specs"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10"
                >
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                    <span className="w-1 h-6 bg-purple-500 rounded-full" />
                    {t("technicalDetails")}
                  </h3>
                  {Object.keys(product.specifications || {}).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {Object.entries(product.specifications).map(([key, val]) => (
                         <div key={key} className="flex justify-between items-center py-4 border-b border-gray-50">
                            <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{key}</span>
                            <span className="font-black text-gray-900">{String(val)}</span>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl">
                       <FileText size={48} className="text-gray-200 mx-auto mb-4" />
                       <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t("noTechnicalSpecs")}</p>
                    </div>
                  )}
                </motion.div>
            )}

            {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10"
                >
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] mb-10 flex items-center gap-3">
                    <span className="w-1 h-6 bg-emerald-500 rounded-full" />
                    {t("movementHistory")}
                  </h3>
                  <div className="text-center py-20 bg-gray-50 rounded-3xl">
                     <History size={48} className="text-gray-200 mx-auto mb-4" />
                     <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No movement history recorded yet</p>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title={t("deleteConfirm.title")}
        message={t("deleteConfirm.message", { name: product.name })}
        confirmText={t("deleteConfirm.confirm")}
      />
    </div>
  );
}
