// src/components/inventory/products/ProductFormSteps/StepMedia.jsx
"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import ImageUploader from "../ProductFormComponents/ImageUploader";

export default function StepMedia({
  formData,
  handleImageUpload,
  removeImage,
  setPrimaryImage,
  updateFormData,
}) {
  const t = useTranslations("products.form");
  const images = formData?.images || [];
  const videoUrls = formData?.videoUrls || [];

  const onUpload = (newImages) => {
    if (typeof handleImageUpload === "function") return handleImageUpload(newImages);
  };

  const onRemove = (key) => {
    if (typeof removeImage === "function") return removeImage(key);
  };

  const onSetPrimary = (key) => {
    if (typeof setPrimaryImage === "function") return setPrimaryImage(key);
  };

  const handleAddVideo = () => {
    updateFormData({ videoUrls: [...videoUrls, ""] });
  };

  const handleVideoChange = (index, value) => {
    const newUrls = [...videoUrls];
    newUrls[index] = value;
    updateFormData({ videoUrls: newUrls });
  };

  const handleRemoveVideo = (index) => {
    const newUrls = videoUrls.filter((_, i) => i !== index);
    updateFormData({ videoUrls: newUrls });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      {/* Images */}
      <div>
        <h3 className="text-lg font-semibold mb-4">{t("fields.productImages")}</h3>
        <ImageUploader
          images={images}
          onUpload={onUpload}
          onRemove={onRemove}
          onSetPrimary={onSetPrimary}
        />
      </div>

      {/* Video URLs */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">{t("fields.videoUrls")}</h3>
        <div className="space-y-3">
          {videoUrls.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => handleVideoChange(index, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                placeholder="https://youtube.com/..."
              />
              <button
                onClick={() => handleRemoveVideo(index)}
                className="text-red-500 hover:text-red-700 font-bold px-2"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            onClick={handleAddVideo}
            className="text-sm text-orange-600 font-semibold hover:text-orange-700"
          >
            {t("fields.addVideoUrl")}
          </button>
        </div>
      </div>
    </motion.div>
  );
}