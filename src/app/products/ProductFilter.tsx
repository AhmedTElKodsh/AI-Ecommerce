// app/products/ProductFilter.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FaFilter, FaSearch } from "react-icons/fa";

type Category = {
  id: string;
  name: string;
};

type ProductFilterProps = {
  currentCategory?: string;
  currentSort?: string;
  currentMinPrice?: string | number;
  currentMaxPrice?: string | number;
  currentSearch?: string;
  categories: Category[];
};

export default function ProductFilter({
  currentCategory,
  currentSort,
  currentMinPrice,
  currentMaxPrice,
  currentSearch,
  categories,
}: ProductFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [category, setCategory] = useState(currentCategory || "");
  const [sort, setSort] = useState(currentSort || "newest");
  const [minPrice, setMinPrice] = useState(
    currentMinPrice ? String(currentMinPrice) : ""
  );
  const [maxPrice, setMaxPrice] = useState(
    currentMaxPrice ? String(currentMaxPrice) : ""
  );
  const [search, setSearch] = useState(currentSearch || "");
  const [isOpen, setIsOpen] = useState(false);

  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();

    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (search) params.set("search", search);

    router.push(`${pathname}?${params.toString()}`);
  };

  // Reset filters
  const resetFilters = () => {
    setCategory("");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setSearch("");
    router.push(pathname);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4 md:hidden">
        <h2 className="text-lg font-semibold">Filters</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          <FaFilter />
        </button>
      </div>

      <div className={`${isOpen ? "block" : "hidden md:block"} space-y-6`}>
        {/* Search */}
        <div>
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
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div>
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
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">
            Price Range
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="minPrice" className="sr-only">
                Min Price
              </label>
              <input
                type="number"
                id="minPrice"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="sr-only">
                Max Price
              </label>
              <input
                type="number"
                id="maxPrice"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Sort */}
        <div>
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

        {/* Apply/Reset Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={applyFilters}
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
