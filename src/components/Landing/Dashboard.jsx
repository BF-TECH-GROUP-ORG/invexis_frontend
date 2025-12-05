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
  Package,
  TrendingUp,
  AlertTriangle,
  Check,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import ProductTable from '@/components/inventory/products/ProductTable';

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
  const [selectedShop, setSelectedShop] = useState(shops.length > 0 ? (shops[0].name || shops[0]) : (stats.shopName || 'All Shops'));
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [tempStatusFilter, setTempStatusFilter] = useState('All Statuses');
  const [selectedIds, setSelectedIds] = useState([]);
  const [openActionDropdown, setOpenActionDropdown] = useState(null);
  const actionDropdownRefs = useRef({});

  const today = new Date();
  const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
  const [currentDate] = useState(formattedDate);

  const shopDropdownRef = useRef(null);
  const filterRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(event.target)) {
        setIsShopDropdownOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
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

  const filteredProducts = products.filter(product => {
    const matchesStatus = statusFilter === 'All Statuses' || product.status === statusFilter;
    const matchesShop = selectedShop === 'All Shops' ||
      product.shop === selectedShop ||
      product.warehouse === selectedShop ||
      product.shop?.name === selectedShop ||
      product.warehouse?.name === selectedShop;
    return matchesStatus && matchesShop;
  });

  const dynamicStats = {
    totalProducts: filteredProducts.length,
    totalStockQuantity: filteredProducts.reduce((acc, product) => acc + (parseInt(product.stock) || 0), 0),
    lowStockCount: filteredProducts.filter(product => product.status === 'Low Stock' || (parseInt(product.stock) > 0 && parseInt(product.stock) < 10)).length,
    outOfStockCount: filteredProducts.filter(product => product.status === 'Out of Stock' || parseInt(product.stock) === 0).length,
  };

  dynamicStats.lowStockPercentage = dynamicStats.totalProducts > 0
    ? Math.round((dynamicStats.lowStockCount / dynamicStats.totalProducts) * 100)
    : 0;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleViewProduct = (product) => {
    setOpenActionDropdown(null);
    toast.success(`Viewing product: ${product.name}`);
    console.log('View product:', product);
  };

  const handleEditProduct = (product) => {
    setOpenActionDropdown(null);
    toast.success(`Editing product: ${product.name}`);
    console.log('Edit product:', product);
  };

  const handleDeleteProduct = (product) => {
    setOpenActionDropdown(null);
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      toast.success(`Product deleted: ${product.name}`);
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

  const statCards = [
    {
      title: "Total Products",
      value: dynamicStats.totalProducts,
      Icon: Package,
      delay: 0
    },
    {
      title: "Total Stock",
      value: dynamicStats.totalStockQuantity.toLocaleString(),
      Icon: TrendingUp,
      delay: 0.1
    },
    {
      title: "Low Stock",
      value: dynamicStats.lowStockCount,
      Icon: AlertTriangle,
      delay: 0.2
    },
    {
      title: "Out of Stock",
      value: dynamicStats.outOfStockCount,
      Icon: () => (
        <svg className="w-9 h-9 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      delay: 0.3
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Inventory Management</h1>
          <div className="text-sm font-medium text-gray-500">As of {currentDate}</div>
        </div>

        {/* Metrics Cards - Clean Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className="bg-white border border-[#E5E5E5] rounded-xl p-6 hover:border-[#EA580C] transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-medium text-[#333]">{stat.title}</h3>
                  <p className="text-3xl font-bold text-[#1F1F1F] mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className="flex items-center">
                  <stat.Icon size={36} className="text-[#F97316]" />
                </div>
              </div>
            </motion.div>
          ))}
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
                <span className="text-sm font-bold text-orange-600">{selectedShop}</span>
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
                        {selectedShop === 'All Shops' && <Check className="w-4 h-4 text-orange-500" />}
                      </button>
                      {shops.map((shop) => (
                        <button
                          key={shop.id || shop._id}
                          onClick={() => handleShopSelect(shop)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                        >
                          {shop.name}
                          {selectedShop === shop.name && <Check className="w-4 h-4 text-orange-500" />}
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
                            className="w-full px-3 py-2 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          >
                            <option>All Statuses</option>
                            <option>In Stock</option>
                            <option>Low Stock</option>
                            <option>Out of Stock</option>
                          </select>
                        </div>

                        <button
                          onClick={handleFilterApply}
                          className="w-full mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
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
          <div className="w-full">
            <ProductTable
              products={filteredProducts}
              selectedIds={selectedIds}
              onSelectIds={setSelectedIds}
              onView={(id) => {
                const p = filteredProducts.find(prod => (prod.id || prod._id) === id);
                if (p) handleViewProduct(p);
              }}
              onEdit={(id) => {
                const p = filteredProducts.find(prod => (prod.id || prod._id) === id);
                if (p) handleEditProduct(p);
              }}
              onDelete={(id) => {
                const p = filteredProducts.find(prod => (prod.id || prod._id) === id);
                if (p) handleDeleteProduct(p);
              }}
              pagination={{
                page: 1, // Simple pagination for now as Dashboard seems single page or handled externally?
                limit: 100, // Show all filtered
                total: filteredProducts.length
              }}
            />
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