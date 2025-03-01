// src/app/categories/page.tsx
import { getCategories } from "@/app/actions/categoryActions";
import Link from "next/link";
import Image from "next/image";
import { FaPlus } from "react-icons/fa";

export const metadata = {
  title: "Categories | ShopNext",
  description: "Browse our product categories",
};

export default async function CategoriesPage() {
  const { categories = [], success, error } = await getCategories();

  // Skip authentication check
  const isAdmin = false; // Set to false by default since we're not checking auth

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Categories</h1>

        {isAdmin && (
          <Link
            href="/admin/categories/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
          >
            <FaPlus className="mr-2" /> Add Category
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No categories found</h2>
          <p className="text-gray-600 mb-6">
            We're currently updating our category list. Please check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-white text-center">
                    {category.name}
                  </h2>
                </div>
              </div>
              {category.description && (
                <div className="p-4 border-t border-gray-200">
                  <p className="text-gray-700 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
