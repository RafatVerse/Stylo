
import React, { useRef, useCallback } from 'react';
import type { UploadedImage } from '../types';
import { Icon } from './Icon';

interface ImageInputProps {
  label: string;
  id: string;
  image: UploadedImage | null;
  onImageChange: (image: UploadedImage) => void;
  onImageRemove: () => void;
  required?: boolean;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export const ImageInput: React.FC<ImageInputProps> = ({
  label,
  id,
  image,
  onImageChange,
  onImageRemove,
  required = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        onImageChange({ file, base64, mimeType: file.type });
      } catch (error) {
        console.error('Error converting file to base64:', error);
      }
    }
  }, [onImageChange]);

  const handleDrop = useCallback(async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       try {
        const base64 = await fileToBase64(file);
        onImageChange({ file, base64, mimeType: file.type });
      } catch (error) {
        console.error('Error converting file to base64:', error);
      }
    }
  }, [onImageChange]);

  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="mt-1">
        <input
          id={id}
          name={id}
          type="file"
          className="sr-only"
          accept="image/png, image/jpeg, image/webp"
          ref={inputRef}
          onChange={handleFileChange}
        />
        <label
          htmlFor={id}
          onDrop={handleDrop}
          onDragEnter={preventDefaults}
          onDragOver={preventDefaults}
          onDragLeave={preventDefaults}
          className="flex justify-center items-center w-full h-48 rounded-lg border-2 border-dashed border-gray-600 hover:border-indigo-500 transition-colors duration-200 cursor-pointer bg-gray-800/50 relative overflow-hidden group"
        >
          {image ? (
            <>
              <img
                src={`data:${image.mimeType};base64,${image.base64}`}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onImageRemove();
                  if(inputRef.current) inputRef.current.value = "";
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-red-500/80 transition-all opacity-0 group-hover:opacity-100 z-20"
                aria-label="Remove image"
              >
                <Icon path="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <Icon path="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" className="mx-auto h-12 w-12" />
              <p className="mt-2 text-sm">Click to upload or drag & drop</p>
              <p className="text-xs">PNG, JPG, WEBP</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};
