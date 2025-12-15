"use client";

import React, { useEffect, useState } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from '@/store';
import { fetchProductById, deleteProduct } from '@/features/products/productsSlice';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, Download, QrCode, X } from 'lucide-react';

function Field({ label, value }) {
  let display;
  if (value === undefined || value === null) display = 'N/A';
  else if (React.isValidElement(value)) display = value;
  else if (typeof value === 'object') {
    if (Array.isArray(value)) display = value.join(', ');
    else if (value.short) display = value.short;
    else display = JSON.stringify(value);
  } else display = value;

  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <div className="mt-1 font-medium wrap-break-word">{display}</div>
    </div>
  );
}

function DetailInner({ id }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const product = useSelector((s) => s.products.selectedProduct);
  const loading = useSelector((s) => s.products.loading);
  const [mainImage, setMainImage] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      const imgs = Array.isArray(product.images) ? product.images : product.images ? [product.images] : [];
      setMainImage(imgs.length ? (imgs[0].url || imgs[0]) : null);
    }
  }, [product]);

  const handleDelete = async () => {
    if (!confirm('Delete this product? This action cannot be undone.')) return;
    try {
      await dispatch(deleteProduct(product._id || product.id)).unwrap();
      toast.success('Product deleted');
      router.push(pathname.replace(/\/[^/]+$/, '/products'));
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = () => {
    const base = (pathname || '').replace(/\/$/, '');
    router.push(`${base}/edit`);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(product || {}, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(product?.sku || product?.name || 'product').toString().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !product) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : product.images ? [product.images] : [];
  const currency = product.pricing?.currency || product.pricingId?.currency || 'RWF';
  const fmt = (v) => (typeof v === 'number' ? new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(v) : v ?? 'N/A');

  const openLightbox = (index = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextLightbox = () => setLightboxIndex((i) => (i + 1) % images.length);
  const prevLightbox = () => setLightboxIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div className="p-1 pt-5">
      <div className="max-w-9xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 rounded-md hover:bg-gray-100">
              <ArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-sm text-gray-500">SKU: <span className="font-medium">{product.sku || product.identifiers?.sku || 'N/A'}</span></p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded">{(typeof product.status === 'object' ? (product.status.active ? 'Active' : 'Inactive') : product.status) || product.availability || 'status unknown'}</span>
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">{product.visibility || 'public'}</span>
                <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">{product.category?.name || product.categoryId?.name || 'Uncategorized'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleExport} className="px-3 py-2 border rounded-md text-sm flex items-center gap-2 hover:bg-gray-50">
              <Download size={16} /> Export JSON
            </button>
            <button onClick={handleEdit} className="px-3 py-2 bg-orange-500 text-white rounded-md text-sm flex items-center gap-2">
              <Edit size={16} /> Edit
            </button>
            <button onClick={handleDelete} className="px-3 py-2 bg-red-500 text-white rounded-md text-sm flex items-center gap-2">
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-6">
          <nav className="flex gap-2 border-b pb-3">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'inventory', label: 'Inventory' },
              { id: 'images', label: 'Images' },
              { id: 'codes', label: 'QR/Barcode' },
              { id: 'specs', label: 'Specifications' },
              { id: 'raw', label: 'Raw' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-3 py-2 text-sm rounded-t-md ${activeTab === t.id ? 'bg-white border border-b-0 -mb-px font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Gallery */}
          <div className="col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="w-full h-72 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                {mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <button onClick={() => openLightbox(images.findIndex(im => (im.url || im) === mainImage))} className="w-full h-full">
                    <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="text-gray-400">No image available</div>
                )}
              </div>

              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {images.map((im, i) => (
                    <button key={i} onClick={() => { setMainImage(im.url || im); openLightbox(i); }} className="h-20 rounded-md overflow-hidden border focus:outline-none focus:ring-2 focus:ring-orange-300">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={im.url || im} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab content */}
            <div>
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Selling Price</p>
                      <p className="text-xl font-bold text-green-600">{fmt(product.pricing?.basePrice ?? product.pricingId?.basePrice ?? product.price)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Cost Price</p>
                      <p className="text-xl font-semibold">{fmt(product.pricing?.cost ?? product.pricingId?.cost ?? product.costPrice)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Stock</p>
                      <p className="text-xl font-semibold">{product.stock?.total ?? product.stock?.available ?? product.inventory?.quantity ?? 0}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Total Value</p>
                      <p className="text-xl font-bold text-orange-600">
                        {fmt(
                          (product.pricing?.basePrice ?? product.pricingId?.basePrice ?? product.price ?? 0) * 
                          (product.stock?.total ?? product.stock?.available ?? product.inventory?.quantity ?? 0)
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm text-gray-600 mb-2">Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field label="Category" value={product.category?.name || product.categoryId?.name || product.category || 'N/A'} />
                      <Field label="Warehouse" value={product.warehouse?.name || product.warehouse || 'N/A'} />
                      <Field label="Date Entered" value={product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'} />
                      <Field label="Expiry Date" value={product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'} />
                      <Field label="Status" value={(typeof product.status === 'object' ? (product.status.active ? 'Active' : 'Inactive') : product.status) || 'N/A'} />
                      <Field label="Visibility" value={product.visibility || 'public'} />
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="text-sm text-gray-600 mb-2">Description</h3>
                    <p className="text-sm text-gray-700">
                      {typeof product.description === 'object' && product.description?.short
                        ? product.description.short
                        : typeof product.description === 'string'
                          ? product.description
                          : 'No description provided.'}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Selling Price" value={fmt(product.pricing?.basePrice ?? product.pricingId?.basePrice ?? product.price)} />
                    <Field label="Cost Price" value={fmt(product.pricing?.cost ?? product.pricingId?.cost ?? product.costPrice)} />
                    <Field label="Discount" value={product.discount ?? product.pricing?.discount ?? '0'} />
                    <Field label="Currency" value={currency} />
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Stock" value={product.stock?.total ?? product.stock?.available ?? product.inventory?.quantity ?? 0} />
                    <Field label="Min Stock" value={product.minStockLevel ?? 'N/A'} />
                    <Field label="Max Stock" value={product.maxStockLevel ?? 'N/A'} />
                    <Field label="Track Inventory" value={product.trackInventory ? 'Yes' : 'No'} />
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.length ? images.map((im, i) => (
                      <div key={i} className="border rounded overflow-hidden">
                        <button onClick={() => openLightbox(i)} className="w-full h-36">
                          <img src={im.url || im} alt={`img-${i}`} className="w-full h-full object-cover" />
                        </button>
                      </div>
                    )) : <div className="text-gray-500">No images available</div>}
                  </div>
                </div>
              )}

              {activeTab === 'codes' && (
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">QR Code</h3>
                    <div className="flex flex-col items-center">
                      <div className="bg-gray-50 p-6 rounded-xl border-2 border-dashed border-gray-200 inline-block">
                        {(product.codes?.qrCodeUrl || product.qrCodeUrl) ? (
                          <img src={product.codes?.qrCodeUrl || product.qrCodeUrl} alt="QR Code" className="w-64 h-64 object-contain" />
                        ) : (
                          <div className="w-64 h-64 flex items-center justify-center text-gray-400 text-sm">No QR Code Available</div>
                        )}
                      </div>
                      {(product.codes?.qrPayload || product.qrCode) && <p className="mt-3 text-sm text-gray-600 font-mono bg-gray-50 px-4 py-2 rounded">{product.codes?.qrPayload || product.qrCode}</p>}
                    </div>
                  </div>

                  {/* Barcode */}
                  <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">Barcode</h3>
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-4 inline-block border rounded-lg">
                        {(product.codes?.barcodeUrl || product.barcodeUrl) ? (
                          <img src={product.codes?.barcodeUrl || product.barcodeUrl} alt="Barcode" className="h-32 object-contain" />
                        ) : (
                          <div className="h-32 w-80 bg-gray-50 flex items-center justify-center text-gray-400 text-sm rounded-lg border-2 border-dashed">No Barcode Available</div>
                        )}
                      </div>
                      {(product.codes?.barcodePayload || product.barcode) && <p className="mt-3 text-sm text-gray-600 font-mono bg-gray-50 px-4 py-2 rounded tracking-widest">{product.codes?.barcodePayload || product.barcode}</p>}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div>
                  <h3 className="text-sm text-gray-600 mb-2">Specifications</h3>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto">{JSON.stringify(product.specifications || product.specs || {}, null, 2)}</pre>
                </div>
              )}

              {activeTab === 'raw' && (
                <div>
                  <h3 className="text-sm text-gray-600 mb-2">Raw Product JSON</h3>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto">{JSON.stringify(product, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={closeLightbox}>
            <div className="relative w-full max-w-4xl">
              <button onClick={(e) => { e.stopPropagation(); prevLightbox(); }} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full">◀</button>
              <button onClick={(e) => { e.stopPropagation(); nextLightbox(); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full">▶</button>
              <img src={images[lightboxIndex]?.url || images[lightboxIndex]} alt={`lightbox-${lightboxIndex}`} className="w-full h-auto max-h-[80vh] object-contain mx-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetailClient({ id }) {
  return (
    <Provider store={store}>
      <DetailInner id={id} />
    </Provider>
  );
}

