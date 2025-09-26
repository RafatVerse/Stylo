export const resizeImageBase64 = (
  base64Image: string,
  mimeType: string,
  maxWidth = 200
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available for thumbnail.'));

      const aspectRatio = img.height / img.width;
      const newWidth = Math.min(img.width, maxWidth);
      const newHeight = newWidth * aspectRatio;

      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      const newBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      resolve(newBase64);
    };
    img.onerror = (err) => reject(new Error('Failed to load image for thumbnail creation.'));
    img.src = `data:${mimeType};base64,${base64Image}`;
  });
};