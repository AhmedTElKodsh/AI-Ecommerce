// src/app/products/ProductFilter.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { FaFilter, FaSearch, FaTimes } from "react-icons/fa";

type Category = {
  id: string;
  name: string;
};

type ProductFilterProps = {
  categories: Category[];
  currentCategory?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentSort?: string;
  currentSearch?: string;
};

export default function ProductFilter({
  categories,
  currentCategory = "",
  currentMinPrice,
  currentMaxPrice,
  currentSort = "newest",
  currentSearch = "",
}: ProductFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState(currentCategory);
  const [minPrice, setMinPrice] = useState(currentMinPrice?.toString() || "");
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice?.toString() || "");
  const [sort, setSort] = useState(currentSort);
  const [search, setSearch] = useState(currentSearch);

  // Update state when props change (e.g., when user navigates back)
  useEffect(() => {
    setCategory(currentCategory);
    setMinPrice(currentMinPrice?.toString() || "");
    setMaxPrice(currentMaxPrice?.toString() || "");
    setSort(currentSort);
    setSearch(currentSearch);
  }, [
    currentCategory,
    currentMinPrice,
    currentMaxPrice,
    currentSort,
    currentSearch,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build query params
    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (sort) params.set("sort", sort);
    if (search) params.set("search", search);

    // Navigate to filtered results
    router.push(`${pathname}?${params.toString()}`);

    // Close mobile filter on submit
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setSearch("");

    router.push(pathname);
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile filter toggle */}
      <div className="lg:hidden p-4 border-b border-gray-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 rounded-md"
        >
          <span className="flex items-center">
            <FaFilter className="mr-2" /> Filters
          </span>
          {isOpen ? <FaTimes /> : <span>+</span>}
        </button>
      </div>

      {/* Filter form - hidden on mobile unless toggled */}
      <div className={`p-6 ${isOpen ? "block" : "hidden lg:block"}`}>
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold mb-4">Filter Products</h2>

          {/* Search */}
          <div className="mb-6">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Price Range
            </h3>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex-1">
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Sort */}
          <div className="mb-6">
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sort By
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
