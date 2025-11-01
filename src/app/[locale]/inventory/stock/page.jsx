'use client';

import { useState } from 'react';
import { ChevronDown, Upload, Calendar, Clock } from 'lucide-react';

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    productName: '',
    description: '',
    category: '',
    sellingPrice: '',
    supplier: '',
    expiredDate: '',
    productQuantity: '',
    discountEnabled: false,
    discountType: '',
    discountValue: '',
    returnDate: '12/12/2024',
    returnTime: '12:00 PM'
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    // Handle form submission here
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-12">
          Add new product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Product Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product name
                </label>
                <input
                  type="text"
                  placeholder="Product name"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select product category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="food">Food & Beverages</option>
                    <option value="books">Books</option>
                    <option value="home">Home & Garden</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Price and Supplier Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Selling price"
                    value={formData.sellingPrice}
                    onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="relative">
                  <select
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Supplier</option>
                    <option value="supplier1">Supplier 1</option>
                    <option value="supplier2">Supplier 2</option>
                    <option value="supplier3">Supplier 3</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Expired Date */}
              <div>
                <input
                  type="text"
                  placeholder="Expired Date"
                  value={formData.expiredDate}
                  onChange={(e) => handleInputChange('expiredDate', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Product Quantity */}
              <div>
                <input
                  type="text"
                  placeholder="Product quantity"
                  value={formData.productQuantity}
                  onChange={(e) => handleInputChange('productQuantity', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Discount Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Discount</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">Add Discount</span>
                    <button
                      type="button"
                      onClick={() => handleInputChange('discountEnabled', !formData.discountEnabled)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        formData.discountEnabled ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.discountEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {formData.discountEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <select
                        value={formData.discountType}
                        onChange={(e) => handleInputChange('discountType', e.target.value)}
                        className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors appearance-none cursor-pointer"
                      >
                        <option value="">Type</option>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      placeholder="Value"
                      value={formData.discountValue}
                      onChange={(e) => handleInputChange('discountValue', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Return Policy */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Return Policy
                  </label>
                  <div className="text-sm text-gray-600 mb-3">Date Added</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.returnDate}
                        onChange={(e) => handleInputChange('returnDate', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                      />
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.returnTime}
                        onChange={(e) => handleInputChange('returnTime', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors"
                      />
                      <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Description and Image */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <textarea
                  placeholder="Description"
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Product Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                />
                                  
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-64 bg-gray-100 border-0 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                >
                                      
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-gray-300 rounded-lg flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-500" />
                        </div>
                        <span className="text-sm text-gray-500">Upload Image</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-4 px-6 rounded-lg font-semibold hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}