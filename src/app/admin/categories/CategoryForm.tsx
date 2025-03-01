// src/app/admin/categories/CategoryForm.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaSpinner, FaUpload, FaTrash } from "react-icons/fa";
import { createCategory, updateCategory } from "@/app/actions/categoryActions";
import { toast } from "react-hot-toast"; 

type CategoryFormProps = {
  category?: {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null;
  };
};

export default function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    category?.image || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    image: category?.image || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // For demo purposes, we'll use a placeholder image
  // In a real app, you would upload to a service like Cloudinary
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a placeholder URL or use FileReader to preview the image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageUrl = event.target.result.toString();
        setFormData((prev) => ({ ...prev, image: imageUrl }));
        setImagePreview(imageUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Fix: Convert FormData to object and pass category.id as first parameter to updateCategory
      const data = {
        name: formData.get("name") as string,
        description: formData.get("description") as string | null,
        image: formData.get("image") as string | null,
      };

      const result = category?.id
        ? await updateCategory(category.id, data)
        : await createCategory(data);

      if (result.success) {
        toast.success(
          category?.id
            ? "Category updated successfully!"
            : "Category created successfully!"
        );
        router.push("/admin/categories");
        router.refresh();
      } else {
        throw new Error(result.error || "Something went wrong");
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category Name *
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

      <div className="mb-6">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Image
        </label>

        <div className="mt-2 flex items-center space-x-6">
          {imagePreview ? (
            <div className="relative w-32 h-32">
              <Image
                src={imagePreview}
                alt="Category preview"
                fill
                sizes="128px"
                className="object-cover rounded-md"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                aria-label="Remove image"
              >
                <FaTrash size={12} />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500">
              No image
            </div>
          )}

          <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
            <span className="flex items-center">
              <FaUpload className="mr-2" /> Upload Image
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
          </label>
        </div>

        <input type="hidden" name="image" value={formData.image} />
        <p className="mt-2 text-sm text-gray-500">
          Recommended size: 800x600 pixels. Max file size: 2MB.
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
              {category ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{category ? "Update Category" : "Create Category"}</>
          )}
        </button>
      </div>
    </form>
  );
}
