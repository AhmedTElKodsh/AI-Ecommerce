// src/components/SortSelector.tsx
"use client";

import { useRouter } from "next/navigation";

interface SortSelectorProps {
  sort: string;
  categoryId?: string;
  page: number;
  baseUrl?: string;
  additionalParams?: Record<string, string>;
}

export default function SortSelector({
  sort,
  categoryId,
  page,
  baseUrl = "/products",
  additionalParams = {},
}: SortSelectorProps) {
  const router = useRouter();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;

    // Build URL parameters
    const params = new URLSearchParams();
    params.append("sort", newSort);
    params.append("page", page.toString());

    // Add any additional filter parameters
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    // Determine base URL (category or products)
    const url = categoryId
      ? `/categories/${categoryId}?${params.toString()}`
      : `${baseUrl}?${params.toString()}`;

    router.push(url);
  };

  return (
    <div className="flex items-center">
      <span className="mr-2 text-gray-600">Sort by:</span>
      <select
        className="border rounded-md px-2 py-1"
        value={sort}
        onChange={handleSortChange}
      >
        <option value="newest">Newest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="name_asc">Name: A to Z</option>
        <option value="name_desc">Name: Z to A</option>
      </select>
    </div>
  );
}
