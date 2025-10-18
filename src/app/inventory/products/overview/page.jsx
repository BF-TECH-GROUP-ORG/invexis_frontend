'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Download, 
  Plus, 
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import Link from 'next/link';

// Sample data for the chart
const chartData = [
  { month: '10', year: 580, products: 520 },
  { month: '11', year: 720, products: 650 },
  { month: '12', year: 640, products: 580 },
  { month: '13', year: 780, products: 720 },
  { month: '14', year: 680, products: 620 }
];

// Sample inventory data
const inventoryData = [
  {
    id: 1,
    productName: 'Iphone 13',
    category: 'phone',
    unitPrice: '800000 RWF',
    inStock: 90,
    discount: '10000RWF',
    status: 'low',
    totalValue: '880000 RWF'
  },
  ...Array.from({ length: 12 }, (_, i) => ({
    id: i + 2,
    productName: 'Product Item ' + (i + 2),
    category: 'Category ' + (i + 2),
    unitPrice: 'Price ' + (i + 2),
    inStock: 100 - i * 5,
    discount: 'Discount ' + (i + 2),
    status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'inactive' : 'active',
    totalValue: 'Value ' + (i + 2)
  }))
];

const StatusBadge = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'low':
        return 'bg-red-100 text-red-600';
      case 'active':
        return 'bg-green-100 text-green-600';
      case 'inactive':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
        status === 'low' ? 'bg-red-500' : 
        status === 'active' ? 'bg-green-500' : 
        'bg-gray-400'
      }`}></div>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  );
};

export default function Inventory() {
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('table');

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedItems(inventoryData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id, checked) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  const SortableHeader = ({ children, sortKey }) => (
    <th 
      className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center space-x-1">
        <span className="truncate">{children}</span>
        <div className="flex flex-col flex-shrink-0">
          <ChevronUp className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${sortConfig.key === sortKey && sortConfig.direction === 'asc' ? 'text-gray-900' : 'text-gray-400'}`} />
          <ChevronDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 -mt-1 ${sortConfig.key === sortKey && sortConfig.direction === 'desc' ? 'text-gray-900' : 'text-gray-400'}`} />
        </div>
      </div>
    </th>
  );

  const InventoryCard = ({ item }) => (
    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <input
            type="checkbox"
            className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
            checked={selectedItems.includes(item.id)}
            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
          />
          <div>
            <h3 className="font-medium text-gray-900 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-[200px]">{item.productName}</h3>
            <p className="text-[10px] sm:text-xs text-gray-500">{item.category}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-2 sm:gap-3 text-[10px] sm:text-sm">
        <div>
          <span className="text-gray-500">Price:</span>
          <div className="font-medium truncate">{item.unitPrice}</div>
        </div>
        <div>
          <span className="text-gray-500">Stock:</span>
          <div className="font-medium">{item.inStock}</div>
        </div>
        <div>
          <span className="text-gray-500">Discount:</span>
          <div className="font-medium truncate">{item.discount}</div>
        </div>
        <div>
          <span className="text-gray-500">Total:</span>
          <div className="font-medium truncate">{item.totalValue}</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center pt-1 sm:pt-2">
        <StatusBadge status={item.status} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-[100vw] sm:max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Inventory Summary</h1>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-[10px] sm:text-xs text-gray-500 mb-1">All Products</div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">240</div>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-[10px] sm:text-xs text-gray-500 mb-1">In Stock</div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">200</div>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
              <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Low Stock</div>
              <div className="text-base sm:text-lg lg:text-xl font-bold text-red-600">20</div>
            </div>
            <div className="bg-white rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <div className="text-[10px] sm:text-xs text-gray-500">Monthly View</div>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
              </div>
              <div className="h-16 sm:h-20 lg:h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barCategoryGap="10%" margin={{ top: 5, right: 0, left: -10, bottom: 0 }}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 8, fill: '#6B7280' }}
                      interval={0}
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        fontSize: '10px'
                      }}
                    />
                    <Bar 
                      dataKey="year" 
                      fill="#3B82F6" 
                      radius={[2, 2, 0, 0]}
                      maxBarSize={10}
                    />
                    <Bar 
                      dataKey="products" 
                      fill="#FB923C" 
                      radius={[2, 2, 0, 0]}
                      maxBarSize={10}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center space-x-2 sm:space-x-3 mt-1 sm:mt-2">
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-[10px] sm:text-xs text-gray-600">Year</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full"></div>
                  <span className="text-[10px] sm:text-xs text-gray-600">Products</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Inventory</h2>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
                <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
                <button className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <Link href='/inventory/stock' className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Add new</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={selectedItems.length === inventoryData.length}
                    />
                  </th>
                  <SortableHeader sortKey="productName">Product name</SortableHeader>
                  <SortableHeader sortKey="category">Category</SortableHeader>
                  <SortableHeader sortKey="unitPrice">Unit price</SortableHeader>
                  <SortableHeader sortKey="inStock">In stock</SortableHeader>
                  <SortableHeader sortKey="discount">Discount</SortableHeader>
                  <SortableHeader sortKey="status">Status</SortableHeader>
                  <SortableHeader sortKey="totalValue">Total Value</SortableHeader>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]">{item.productName}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500 truncate max-w-[100px]">{item.category}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.unitPrice}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.inStock}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.discount}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.totalValue}</div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tablet Table View (Simplified) */}
          <div className="hidden md:block lg:hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-2 sm:py-3 text-left">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      checked={selectedItems.length === inventoryData.length}
                    />
                  </th>
                  <SortableHeader sortKey="productName">Product</SortableHeader>
                  <SortableHeader sortKey="unitPrice">Price</SortableHeader>
                  <SortableHeader sortKey="inStock">Stock</SortableHeader>
                  <SortableHeader sortKey="status">Status</SortableHeader>
                  <th className="px-3 sm:px-4 py-2 sm:py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-orange-500 focus:ring-orange-500 w-4 h-4"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[150px]">{item.productName}</div>
                      <div className="text-[10px] sm:text-xs text-gray-500">{item.category}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-500">{item.unitPrice}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-500">{item.inStock}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
            {inventoryData.map((item) => (
              <InventoryCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}