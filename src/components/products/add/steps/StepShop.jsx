"use client";

import { useState, useEffect } from "react";
import { getBranches } from "@/services/branches";
import { Search, Store, MapPin } from "lucide-react";

export default function StepShop({ formData, updateFormData }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchShops();
  }, [formData.companyId]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await getBranches(formData.companyId);
      // Handle various response structures similar to what shopService did or assume direct array
      const data = response.data || response.shops || response;
      setShops(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShopSelect = (shop) => {
    updateFormData({
      shopId: shop.id,
      shopName: shop.name || shop.branchName, // Handle variations
    });
  };

  const filteredShops = shops.filter((shop) =>
    (shop.name || shop.branchName || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Select Shop
        </h2>
        <p className="text-gray-600">
          Choose the shop where this product will be available
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search shops..."
          className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Selected Shop Display */}
      {formData.shopId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Store className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Selected Shop:</p>
                <p className="font-semibold text-gray-900">
                  {formData.shopName || "Selected Shop"}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                updateFormData({
                  shopId: "",
                  shopName: "",
                })
              }
              className="text-red-500 hover:text-red-700 text-sm font-medium"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        {filteredShops.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            No shops found
          </div>
        ) : (
          filteredShops.map((shop) => (
            <button
              key={shop.id}
              onClick={() => handleShopSelect(shop)}
              className={`flex items-start p-4 border-2 rounded-lg text-left transition-all ${
                formData.shopId === shop.id
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-orange-300 hover:bg-orange-50"
              }`}
            >
              <div
                className={`p-3 rounded-full mr-4 ${
                  formData.shopId === shop.id
                    ? "bg-orange-100 text-orange-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <Store className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {shop.name || shop.branchName}
                </div>
                {shop.location && (
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate">
                      {shop.location.address ||
                        shop.location.city ||
                        "No address"}
                    </span>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  {shop.type || "Retail Store"}
                </div>
              </div>
              {formData.shopId === shop.id && (
                <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-sm mt-1"></div>
              )}
            </button>
          ))
        )}
      </div>

      {!formData.shopId && (
        <p className="text-red-500 text-sm flex items-center">
          <span className="mr-2">⚠️</span> Please select a shop to continue
        </p>
      )}
    </div>
  );
}
