// Fix: Removed circular import of 'UploadedImage'. The type is defined in this file.
export interface UploadedImage {
  file?: File;
  base64: string;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  previewImage: string; // Storing a reasonably sized preview instead of the full image
  thumbnail: string;
  productImage: { base64: string; mimeType: string };
  referenceImage: { base64: string; mimeType: string } | null;
  aspectRatio: string;
  lightingStyle: string;
  cameraPerspective: string;
  createdAt: string;
}