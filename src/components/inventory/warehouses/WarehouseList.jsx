"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, MapPin, Package, TrendingUp } from "lucide-react";
import { fetchWarehouses } from "@/features/warehouses/warehousesSlice";
import WarehouseCard from "./WarehouseCard";
import AddWarehouseModal from "./AddWarehouseModal";
import WarehouseStats from "./WarehouseStats";

export default function WarehouseList() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.warehouses);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    dispatch(fetchWarehouses());
  }, [dispatch]);

  const stats = {
    total: items.length,
    active: items.filter(w => w.isActive).length,
    totalCapacity: items.reduce((sum, w) => sum + (w.capacity || 0), 0),
    utilizationRate: 75, // Calculate from actual data
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <WarehouseStats stats={stats} />

      <div className="mt-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
            <p className="text-sm text-gray-500 mt-1">{items.length} total warehouses</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus size={18} />
            Add Warehouse
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <MapPin className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-lg text-gray-500">No warehouses found</p>
            <p className="text-sm text-gray-400 mt-2">Add your first warehouse to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((warehouse) => (
              <WarehouseCard key={warehouse._id} warehouse={warehouse} />
            ))}
          </div>
        )}
      </div>

      {showAddModal && <AddWarehouseModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
}