"use client";

import { Upload } from "lucide-react";

export default function ImageUploader({ images, onUpload, onRemove, onSetPrimary }) {
  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'];

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        Product Images & Videos (Max {MAX_IMAGES}, 50MB each)
      </label>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-500 transition bg-gray-50">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.webm,image/*,video/*"
          multiple
          onChange={onUpload}
          className="hidden"
          id="image-upload"
          disabled={images.length >= MAX_IMAGES}
        />
        <label htmlFor="image-upload" className="cursor-pointer">
          <Upload className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-sm text-gray-600 mb-2">
            {images.length >= MAX_IMAGES ? "Maximum files reached" : "Click or drag images/videos here"}
          </p>
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => document.getElementById('image-upload').click()}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Choose Files
            </button>
          )}
          <p className="text-xs text-gray-500 mt-2">{images.length}/{MAX_IMAGES} files uploaded</p>
          <p className="text-xs text-gray-400 mt-1">Supported: JPG, PNG, GIF, WebP, MP4, MOV, AVI, WebM</p>
        </label>
      </div>

      {/* Image/Video Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              {image.url?.match(/\.(mp4|mov|avi|webm)$/i) ? (
                <video
                  src={image.url}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                  muted
                />
              ) : (
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              )}
              {image.isPrimary && (
                <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded font-semibold">
                  Primary
                </span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition rounded-lg flex flex-col items-center justify-center gap-2">
                {!image.isPrimary && (
                  <button
                    type="button"
                    onClick={() => onSetPrimary(index)}
                    className="px-3 py-1 bg-white text-gray-900 rounded text-xs font-medium hover:bg-gray-100"
                  >
                    Set Primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}