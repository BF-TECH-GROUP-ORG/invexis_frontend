"use client";

import { useState } from "react";
import { Upload, X, Video } from "lucide-react";

export default function Step2Media({ formData, updateFormData }) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    if (formData.images.length + files.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }

    // In production, upload to storage and get URLs
    // For now, create preview URLs
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData({
          images: [...formData.images, { url: reader.result, file }],
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
  };

  const addVideoUrl = () => {
    updateFormData({
      videoUrls: [...formData.videoUrls, ""],
    });
  };

  const updateVideoUrl = (index, value) => {
    const newUrls = [...formData.videoUrls];
    newUrls[index] = value;
    updateFormData({ videoUrls: newUrls });
  };

  const removeVideoUrl = (index) => {
    const newUrls = formData.videoUrls.filter((_, i) => i !== index);
    updateFormData({ videoUrls: newUrls });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Images & Media
        </h2>
        <p className="text-gray-600">
          Upload product images and add video links
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images <span className="text-red-500">*</span>
          <span className="text-gray-500 font-normal ml-2">
            (Max 10 images)
          </span>
        </label>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 transition-colors">
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500">PNG, JPG, WEBP up to 10MB</p>
          </label>
        </div>

        {/* Image Preview Grid */}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-5 gap-4 mt-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Uploads */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Videos (Optional)
        </label>

        {/* Video File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors mb-4">
          <input
            type="file"
            id="video-upload"
            accept="video/mp4,video/webm,video/ogg"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              if (file.size > 50 * 1024 * 1024) {
                // 50MB limit
                alert("Video file size must be less than 50MB");
                return;
              }
              const url = URL.createObjectURL(file);
              updateFormData({
                videoFiles: [
                  ...(formData.videoFiles || []),
                  { url, file, name: file.name },
                ],
              });
            }}
            className="hidden"
          />
          <label htmlFor="video-upload" className="cursor-pointer">
            <Video className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-1">Click to upload video file</p>
            <p className="text-xs text-gray-400">MP4, WebM up to 50MB</p>
          </label>
        </div>

        {/* Video Files Preview */}
        {formData.videoFiles && formData.videoFiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {formData.videoFiles.map((video, index) => (
              <div
                key={index}
                className="relative group border rounded-lg p-2 bg-gray-50"
              >
                <div className="aspect-video bg-black rounded overflow-hidden mb-2">
                  <video src={video.url} controls className="w-full h-full" />
                </div>
                <div className="flex justify-between items-center text-xs text-gray-600 px-1">
                  <span className="truncate max-w-[80%]">{video.name}</span>
                  <button
                    onClick={() => {
                      const newFiles = formData.videoFiles.filter(
                        (_, i) => i !== index
                      );
                      updateFormData({ videoFiles: newFiles });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 my-4"></div>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video URLs (YouTube/Vimeo)
        </label>
        <div className="space-y-3">
          {formData.videoUrls.map((url, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => updateVideoUrl(index, e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={() => removeVideoUrl(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addVideoUrl}
          className="mt-3 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          + Add Video URL
        </button>
      </div>
    </div>
  );
}
