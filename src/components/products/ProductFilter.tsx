// src/components/products/ProductFilter.tsx
"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Category = {
  id: string;
  name: string;
};

type ProductFilterProps = {
  categories: Category[];
  selectedCategory?: string;
  selectedSort?: string;
};

export default function ProductFilter({
  categories,
  selectedCategory,
  selectedSort,
}: ProductFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create a new URLSearchParams instance to modify
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      
      // Reset page when changing filters
      params.delete("page");
      
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      
      return params.toString();
    },
    [searchParams]
  );

  // Handle category change
  const handleCategoryChange = (categoryId: string) => {
    router.push(`${pathname}?${createQueryString("category", categoryId)}`);
  };

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    router.push(`${pathname}?${createQueryString("sort", e.target.value)}`);
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-md font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="category-all"
              name="category"
              type="radio"
              checked={!selectedCategory}
              onChange={() => handleCategoryChange("")}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="category-all"
              className="ml-3 text-sm text-gray-600"
            >
              All Categories
            </label>
          </div>

          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <input
                id={`category-${category.id}`}
                name="category"
                type="radio"
                checked={selectedCategory === category.id}
                onChange={() => handleCategoryChange(category.id)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`category-${category.id}`}
                className="ml-3 text-sm text-gray-600"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-md font-medium mb-3">Sort By</h3>
        <select
          value={selectedSort || ""}
          onChange={handleSortChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>
      </div>
    </div>
  );
}