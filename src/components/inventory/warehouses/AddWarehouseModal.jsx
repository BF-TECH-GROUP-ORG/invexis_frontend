"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createWarehouse } from "@/features/warehouses/warehousesSlice";
import { toast } from "react-hot-toast";

export default function AddWarehouseModal({ onClose, editData = null }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: editData?.name || "",
    location: {
      address: editData?.location?.address || "",
      city: editData?.location?.city || "",
      country: editData?.location?.country || "Rwanda",
    },
    capacity: editData?.capacity || "",
    manager: editData?.manager || "",
    isActive: editData?.isActive ?? true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(createWarehouse(formData)).unwrap();
      toast.success("Warehouse created successfully! 🎉");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to create warehouse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="text-2xl font-bold">Add New Warehouse</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Main Warehouse"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.location.city}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value }
                    })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Kigali"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.location.country}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, country: e.target.value }
                    })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Rwanda"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Address *</label>
                <textarea
                  required
                  value={formData.location.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value }
                  })}
                  rows={3}
                  className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Full address..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Capacity (m³) *</label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="10000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Manager</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-orange-500"
                  id="active-status"
                />
                <label htmlFor="active-status" className="text-sm font-medium cursor-pointer">
                  Set as Active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition font-medium"
              >
                {loading ? "Creating..." : "Create Warehouse"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}