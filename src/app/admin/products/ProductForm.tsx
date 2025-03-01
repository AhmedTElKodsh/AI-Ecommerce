// src/app/admin/products/ProductForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaSpinner, FaUpload, FaTrash } from "react-icons/fa";
import { createProduct, updateProduct } from "@/app/actions/productActions";

type Category = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: Category[];
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    images: string[];
  };
  isEdit?: boolean;
};

export default function ProductForm({
  categories,
  product,
  isEdit = false,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>(product?.images || []);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    stock: product?.stock?.toString() || "",
    categoryId: product?.categoryId || categories[0]?.id || "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // For demo purposes, we'll just use placeholder images
    // In a real app, you would upload these to a service like Cloudinary
    const newImages = Array.from(files).map(
      (_, index) =>
        `https://via.placeholder.com/500?text=Product+Image+${
          images.length + index + 1
        }`
    );

    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { name, description, price, stock, categoryId } = formData;

      // Validate form data
      if (!name || !description || !price || !stock || !categoryId) {
        throw new Error("All fields are required");
      }

      if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        throw new Error("Price must be a positive number");
      }

      if (isNaN(parseInt(stock)) || parseInt(stock) < 0) {
        throw new Error("Stock must be a non-negative integer");
      }

      if (images.length === 0) {
        throw new Error("At least one product image is required");
      }

      // Create form data for submission
      const submitFormData = new FormData();

      if (isEdit && product) {
        submitFormData.append("id", product.id);
      }

      submitFormData.append("name", name);
      submitFormData.append("description", description);
      submitFormData.append("price", price);
      submitFormData.append("stock", stock);
      submitFormData.append("categoryId", categoryId);

      // Add images
      images.forEach((image) => {
        submitFormData.append("images", image);
      });

      // Submit form
      const result = isEdit
        ? await updateProduct(submitFormData)
        : await createProduct(submitFormData);

      if (result.success) {
        router.push("/admin/products");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to save product");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">
        {isEdit ? "Edit Product" : "Add New Product"}
      </h2>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Product Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category *
          </label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Price ($) *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            min="0.01"
            step="0.01"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Stock *
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
            min="0"
            step="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images *
        </label>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative rounded-md overflow-hidden border border-gray-200">
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove image"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ))}

          {/* Image upload button */}
          <label className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
            <div className="text-center p-4">
              <FaUpload className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Add Image</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              multiple
            />
          </label>
        </div>

        <p className="text-sm text-gray-500">
          Upload product images. First image will be used as the product
          thumbnail.
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEdit ? "Update Product" : "Create Product"}</>
          )}
        </button>
      </div>
    </form>
  );
}
