/**
 * Compress an image file using Canvas API
 * @param {File} file - The image file to compress
 * @param {object} options - Compression options
 * @param {number} options.maxWidth - Maximum width of the output image (default: 1200)
 * @param {number} options.maxHeight - Maximum height of the output image (default: 1200)
 * @param {number} options.quality - JPEG quality (0 to 1) (default: 0.7)
 * @returns {Promise<File>} Compressed file
 */
export const compressImage = async (file, options = {}) => {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.7 } = options;

  return new Promise((resolve, reject) => {
    // If not an image, return original
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "white"; // Handle transparent PNGs turning black
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob conversion failed"));
              return;
            }

            // Create new file with same name but jpeg extension/type
            const newFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, "") + ".jpg",
              {
                type: "image/jpeg",
                lastModified: Date.now(),
              }
            );

            // Log compression stats
            // console.log(
            //   `Compressed: ${(file.size / 1024).toFixed(2)}KB -> ${(
            //     newFile.size / 1024
            //   ).toFixed(2)}KB`
            // );

            resolve(newFile);
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = (err) => reject(err);
    };

    reader.onerror = (err) => reject(err);
  });
};
