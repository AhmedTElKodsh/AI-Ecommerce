// src/components/products/ProductImageGallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductImageGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
        <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
          No image available
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
        <Image
          src={images[selectedImage] || ""}
          alt={productName}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                selectedImage === index
                  ? "border-indigo-600"
                  : "border-transparent"
              }`}
            >
              <Image
                src={image || ""}
                alt={`${productName} - Image ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}