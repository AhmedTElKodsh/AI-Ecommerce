// src/components/PriceFilter.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface PriceFilterProps {
  initialMinPrice?: string;
  initialMaxPrice?: string;
  categoryId?: string;
  page: number;
  sort: string;
  baseUrl?: string;
}

export default function PriceFilter({
  initialMinPrice,
  initialMaxPrice,
  categoryId,
  page,
  sort,
  baseUrl = "/products",
}: PriceFilterProps) {
  const [minPrice, setMinPrice] = useState(initialMinPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice || "");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build URL parameters
    const params = new URLSearchParams();

    if (minPrice) params.append("minPrice", minPrice);
    if (maxPrice) params.append("maxPrice", maxPrice);
    params.append("page", "1"); // Reset to page 1 when applying filters
    params.append("sort", sort);

    // Determine base URL (category or products)
    const url = categoryId
      ? `/categories/${categoryId}?${params.toString()}`
      : `${baseUrl}?${params.toString()}`;

    router.push(url);
  };

  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Price Range</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            className="border rounded p-2 w-full"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Max"
            className="border rounded p-2 w-full"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white rounded px-3 py-1 w-full hover:bg-indigo-700 transition-colors"
        >
          Apply
        </button>
      </form>
    </div>
  );
}
