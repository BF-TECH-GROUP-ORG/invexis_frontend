'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { deleteProductApi } from '@/services/productsService';
import {
  ChevronDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  Printer,
  Calendar,
  Check,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function AnalyticsDashboard({
  products = [],
  shops = [],
  stats = {
    totalProducts: 0,
    totalStockQuantity: 0,
    lowStockCount: 0,
    lowStockPercentage: 0,
    outOfStockCount: 0,
    shopName: 'All Shops',
    shopRevenue: 0
  }
}) {
  const [selectedShop, setSelectedShop] = useState(stats.shopName || 'All Shops');
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [tempStatusFilter, setTempStatusFilter] = useState('All Statuses');

  // Actions dropdown state
  const [openActionDropdown, setOpenActionDropdown] = useState(null);
  const actionDropdownRefs = useRef({});

  // Format current date as DD/MM/YYYY
  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  const [currentDate] = useState(formattedDate);

  const shopDropdownRef = useRef(null);
  const filterRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(event.target)) {
        setIsShopDropdownOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      // Check action dropdowns
      if (openActionDropdown !== null) {
        const currentDropdownRef = actionDropdownRefs.current[openActionDropdown];
        if (currentDropdownRef && !currentDropdownRef.contains(event.target)) {
          setOpenActionDropdown(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openActionDropdown]);

  const handleShopSelect = (shop) => {
    setSelectedShop(shop.name || shop);
    setIsShopDropdownOpen(false);
    toast.success(`Switched to ${shop.name || shop}`);
  };

  const handleFilterApply = () => {
    setStatusFilter(tempStatusFilter);
    setIsFilterOpen(false);
    toast.success("Filters applied successfully");
  };

  // Filter products based on status
  const filteredProducts = products.filter(product => {
    if (statusFilter === 'All Statuses') return true;
    return product.status === statusFilter;
  });

  // Action handlers
  const handleViewProduct = (product) => {
    setOpenActionDropdown(null);
    toast.success(`Viewing product: ${product.name}`);
    // TODO: Navigate to product view page
    console.log('View product:', product);
  };

  const handleEditProduct = (product) => {
    setOpenActionDropdown(null);
    toast.success(`Editing product: ${product.name}`);
    // TODO: Navigate to product edit page
    console.log('Edit product:', product);
  };

  const handleDeleteProduct = (product) => {
    setOpenActionDropdown(null);
    // TODO: Show confirmation dialog before deleting
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      toast.success(`Product deleted: ${product.name}`);
      // TODO: Call delete API
      console.log('Delete product:', product);
    }
  };

  const toggleActionDropdown = (productId) => {
    setOpenActionDropdown(openActionDropdown === productId ? null : productId);
  };

  const StatusBadge = ({ status }) => {
    const getStatusStyle = (status) => {
      switch (status) {
        case 'In Stock':
          return 'bg-green-50 text-green-600 border border-green-100';
        case 'Low Stock':
          return 'bg-orange-50 text-orange-600 border border-orange-100';
        case 'Out of Stock':
          return 'bg-red-50 text-red-600 border border-red-100';
        default:
          return 'bg-gray-50 text-gray-600 border border-gray-100';
      }
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(status)}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Inventory Management</h1>
          <div className="text-sm font-medium text-gray-500">As of {currentDate}</div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Products in Inventory */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Total Products in Inventory</h3>
            <div className="flex items-baseline space-x-2 mb-4">
              <span className="text-4xl font-bold text-gray-900">{stats.totalProducts}</span>
              <span className="text-xl font-bold text-blue-500">SKUs</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500">Currently in system</span>
            </div>
          </div>

          {/* Total Stock Quantity Available */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Total Stock Quantity Available</h3>
            <div className="text-3xl font-bold text-gray-900 mb-4">{stats.totalStockQuantity.toLocaleString()}</div>
            <div className="flex items-center space-x-1 text-xs font-medium text-emerald-500">
              <span>Items across all products</span>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Low Stock Alerts</h3>
            <div className="flex items-center justify-between">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle (Gray) */}
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="5"
                  />
                  {/* Progress Circle (Orange) */}
                  <path
                    d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="5"
                    strokeDasharray={`${stats.lowStockPercentage}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold text-orange-500">{stats.lowStockCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-xs">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-gray-700 font-medium">Low Stock</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="text-gray-500">Below minimum threshold</span>
                </div>
              </div>
            </div>
          </div>

          {/* Out of Stock Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Out of Stock Items</h3>
            <div className="flex items-baseline space-x-2 mb-4">
              <span className="text-4xl font-bold text-red-600">{stats.outOfStockCount}</span>
              <span className="text-xl font-bold text-gray-500">Products</span>
            </div>
            <div className="text-xs font-medium text-red-500">⚠️ Require immediate restocking</div>
          </div>
        </div>

        {/* Main Content Card - Inventory Status Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            {/* Title Section */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900">Inventory Status Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Complete inventory tracking with stock levels and status</p>
            </div>

            {/* Toolbar Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative">
              {/* Total Value Pill */}
              <div className="inline-flex items-center px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <span className="text-sm font-medium text-gray-600 mr-2">Viewing inventory for:</span>
                <span className="text-sm font-bold text-emerald-500">{selectedShop}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-8 relative">
                {/* Shops Dropdown Trigger */}
                <div className="relative" ref={shopDropdownRef}>
                  <button
                    onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    <span>{selectedShop}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isShopDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isShopDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                      <button
                        onClick={() => handleShopSelect('All Shops')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                      >
                        All Shops
                        {selectedShop === 'All Shops' && <Check className="w-4 h-4 text-emerald-500" />}
                      </button>
                      {shops.map((shop) => (
                        <button
                          key={shop.id || shop._id}
                          onClick={() => handleShopSelect(shop)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                        >
                          {shop.name}
                          {selectedShop === shop.name && <Check className="w-4 h-4 text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filters Trigger */}
                <div className="relative" ref={filterRef}>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900"
                  >
                    <Filter className="w-4 h-4 text-gray-400" />
                    <span>Filters</span>
                  </button>

                  {/* Filter Popup */}
                  {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-10">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Filter Products</h3>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Stock Status</label>
                          <select
                            value={tempStatusFilter}
                            onChange={(e) => setTempStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            <option>All Statuses</option>
                            <option>In Stock</option>
                            <option>Low Stock</option>
                            <option>Out of Stock</option>
                          </select>
                        </div>

                        <button
                          onClick={handleFilterApply}
                          className="w-full mt-2 px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50/50 border-y border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-200">
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{product.price}</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <StatusBadge status={product.status} />
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block" ref={(el) => actionDropdownRefs.current[product.id] = el}>
                          <button
                            onClick={() => toggleActionDropdown(product.id)}
                            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {openActionDropdown === product.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                              <button
                                onClick={() => handleViewProduct(product)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </button>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit className="w-4 h-4" />
                                Edit Product
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Product
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 border-b border-gray-200">
                      No products found matching your filters.
                    </td>
                  </tr>
                )}
                {/* Empty rows to match the look of the table in the image if needed, but data is better */}
                {[1, 2, 3, 4].map((i) => (
                  <tr key={`empty-${i}`} className="h-16 border-b border-gray-200">
                    <td colSpan="6" className=""></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-100 flex justify-end items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}