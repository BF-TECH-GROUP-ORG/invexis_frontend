'use client';

import { useState } from 'react';
import ProductDetailsTable from '@/components/inventory/ProductDetailsTable';
import ProductForm from '@/components/inventory/ProductForm';
import { X } from 'lucide-react';

export default function ProductDetailsPage() {
  const [showForm, setShowForm] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const handleAddNew = () => {
    setProductToEdit(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setProductToEdit(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all your product details, categories, and pricing info.
          </p>
        </div>
      </div>

      {/* Product Table */}
      <ProductDetailsTable onAddNew={handleAddNew} />

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-4xl relative animate-fadeIn">
            {/* Close Button */}
            <button
              onClick={handleCloseForm}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-h-[90vh] overflow-y-auto p-6">
              <ProductForm onClose={handleCloseForm} productToEdit={productToEdit} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
