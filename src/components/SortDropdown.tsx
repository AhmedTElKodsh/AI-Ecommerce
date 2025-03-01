// src/app/components/SortDropdown.tsx
"use client";

import { useRouter } from "next/navigation";

interface SortDropdownProps {
  currentSort: string;
  categoryId: string;
  currentPage: number;
}

export default function SortDropdown({
  currentSort,
  categoryId,
  currentPage,
}: SortDropdownProps) {
  const router = useRouter();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    // Navigate to the same page with new sort parameter
    router.push(
      `/categories/${categoryId}?page=${currentPage}&sort=${newSort}`
    );
  };

  return (
    <div className="flex items-center">
      <label htmlFor="sort" className="mr-2 text-gray-600">
        Sort by:
      </label>
      <select
        id="sort"
        name="sort"
        value={currentSort}
        onChange={handleSortChange}
        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Top Rated</option>
      </select>
    </div>
  );
}
