import { useState } from "react";
import { compressImage } from "@/lib/mediaUtils";
import {
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  Loader2,
} from "lucide-react";

export default function Step2Media({ formData, updateFormData }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  // Constants
    const MAX_IMAGES = 5;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (formData.images.length + files.length > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    try {
      setIsCompressing(true);

      // Compress all images in parallel
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          try {
            return await compressImage(file, { quality: 0.7, maxWidth: 1200 });
          } catch (err) {
            console.error("Compression failed for", file.name, err);
            return file; // Fallback to original
          }
        })
      );

      // Read compressed files to get data URL for display
      const newImages = await Promise.all(
        processedFiles.map((file) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({ url: reader.result, file });
            };
            reader.readAsDataURL(file);
          });
        })
      );

      // Update state once with all new images
      updateFormData({
        images: [...formData.images, ...newImages],
      });
    } catch (error) {
      console.error("Error processing images:", error);
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
    if (currentImageIndex >= newImages.length && newImages.length > 0) {
      setCurrentImageIndex(newImages.length - 1);
    }
  };

  const setPrimaryImage = (index, e) => {
    e.stopPropagation();
    const newImages = [...formData.images];
    const selectedImage = newImages[index];

    // Remove from current position
    newImages.splice(index, 1);
    // Add to front
    newImages.unshift(selectedImage);

    updateFormData({ images: newImages });
    setCurrentImageIndex(0);
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % formData.images.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + formData.images.length) % formData.images.length
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Images & Media
        </h2>
        <p className="text-gray-600">
          Upload product images. The first image will be the primary one.
        </p>
      </div>

      {/* Image Upload Area */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <label className="text-sm font-medium text-gray-700">
            Product Images <span className="text-red-500">*</span>
            <span className="text-gray-500 font-normal ml-2">
              (Max {MAX_IMAGES})
            </span>
          </label>
        </div>

        {/* Custom Carousel */}
        {formData.images.length > 0 ? (
          <div className="relative bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 aspect-[16/9] mb-6 group">
            {/* Main Image */}
            <img
              src={formData.images[currentImageIndex].url}
              alt="Product"
              className="w-full h-full object-contain cursor-pointer transition-transform duration-300 hover:scale-105"
              onClick={() => setIsModalOpen(true)}
            />

            {/* Overlays */}
            <div className="absolute top-4 left-4 flex gap-2">
              {currentImageIndex === 0 ? (
                <span className="bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Primary
                </span>
              ) : (
                <button
                  onClick={(e) => setPrimaryImage(currentImageIndex, e)}
                  className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium shadow-sm hover:bg-white hover:text-orange-500 transition-colors flex items-center gap-1"
                >
                  <Star className="w-3 h-3" /> Set as Primary
                </button>
              )}
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-700 hover:text-blue-500 transition-colors shadow-sm"
                title="View Fullscreen"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(currentImageIndex);
                }}
                className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-700 hover:text-red-500 transition-colors shadow-sm"
                title="Remove Image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Buttons */}
            {formData.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-md text-gray-800 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white shadow-md text-gray-800 transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Pagination Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {formData.images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex
                      ? "bg-orange-500 w-4"
                      : "bg-gray-300"
                    }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-orange-500 transition-colors bg-gray-50 mb-6 relative">
            {isCompressing ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
                <p className="text-gray-500">Compressing images...</p>
              </div>
            ) : (
              <>
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <Upload className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    Click to upload images
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, WEBP up to 10MB
                  </p>
                </label>
              </>
            )}
          </div>
        )}

        {/* Thumbs / Add more */}
        {formData.images.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            <div
              className={`shrink-0 w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 cursor-pointer hover:border-orange-500 transition-colors ${isCompressing ? "opacity-50 pointer-events-none" : ""
                }`}
              onClick={() =>
                !isCompressing &&
                document.getElementById("image-upload-more").click()
              }
            >
              {isCompressing ? (
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              ) : (
                <>
                  <input
                    type="file"
                    id="image-upload-more"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-gray-400" />
                </>
              )}
            </div>
            {formData.images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${idx === currentImageIndex
                    ? "border-orange-500 ring-2 ring-orange-200"
                    : "border-gray-200 opacity-60 hover:opacity-100"
                  }`}
              >
                <img
                  src={img.url}
                  className="w-full h-full object-cover"
                  alt=""
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200"></div>

      {/* Full Screen Modal */}
      {isModalOpen && formData.images.length > 0 && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-white/70 hover:text-white p-2"
            >
              <X className="w-10 h-10" />
            </button>

            <img
              src={formData.images[currentImageIndex].url}
              className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
              alt="Full View"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-4">
              {formData.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => prevImage(e)}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={(e) => nextImage(e)}
                    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-colors"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
