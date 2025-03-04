// src/components/CategoryFilter.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategoryId?: string;
  baseUrl?: string;
}

export default function CategoryFilter({
  categories,
  selectedCategoryId,
  baseUrl = "/products",
}: CategoryFilterProps) {
  const router = useRouter();

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-3">Categories</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href={baseUrl}
            className={`block text-gray-700 hover:text-indigo-600 ${
              !selectedCategoryId ? "font-semibold text-indigo-600" : ""
            }`}
          >
            All Categories
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/categories/${category.id}`}
              className={`block text-gray-700 hover:text-indigo-600 ${
                selectedCategoryId === category.id
                  ? "font-semibold text-indigo-600"
                  : ""
              }`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
