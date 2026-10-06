const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Could not decode the selected image.'));
  image.src = src;
});

export const optimizeImageFile = async (file, maxDimension = 480, { square = false } = {}) => {
  if (!file || !file.type.startsWith('image/')) {
    throw new Error('Choose an image file.');
  }

  let bitmap;
  let fallbackImage;
  let fallbackUrl;
  if (typeof createImageBitmap === 'function') {
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      // Fall back to HTML image decoding for browsers that cannot create a bitmap.
    }
  }
  if (!bitmap) {
    fallbackUrl = URL.createObjectURL(file);
    try {
      fallbackImage = await loadImage(fallbackUrl);
    } catch (error) {
      URL.revokeObjectURL(fallbackUrl);
      throw error;
    }
  }

  try {
    const image = bitmap || fallbackImage;
    const width = image.width;
    const height = image.height;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not prepare the image for saving.');

    if (square) {
      const cropSize = Math.min(width, height);
      const cropX = (width - cropSize) / 2;
      const cropY = (height - cropSize) / 2;
      canvas.width = maxDimension;
      canvas.height = maxDimension;
      context.drawImage(
        image,
        cropX,
        cropY,
        cropSize,
        cropSize,
        0,
        0,
        maxDimension,
        maxDimension
      );
    } else {
      const scale = Math.min(1, maxDimension / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/webp', 0.82);
  } finally {
    bitmap?.close();
    if (fallbackUrl) URL.revokeObjectURL(fallbackUrl);
  }
};
