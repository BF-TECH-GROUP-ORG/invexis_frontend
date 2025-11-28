"use client";

import { MapPin, Package, Users, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function WarehouseCard({ warehouse }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{warehouse.name}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin size={14} />
            {warehouse.location?.city || "N/A"}, {warehouse.location?.country || "N/A"}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          warehouse.isActive 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {warehouse.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Package size={16} />
            Capacity
          </span>
          <span className="font-semibold">{warehouse.capacity?.toLocaleString() || 0} m³</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Users size={16} />
            Manager
          </span>
          <span className="font-semibold">{warehouse.manager || "Unassigned"}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition">
          <Edit size={16} />
          Edit
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
          <Trash2 size={16} />
          Delete
        </button>
      </div>
    </motion.div>
  );
}