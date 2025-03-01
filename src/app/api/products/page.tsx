("use client");

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaFilter, FaSort, FaSpinner } from "react-icons/fa";

// Define product type
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("default");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Replace with your actual API endpoint
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data);

        // Extract unique categories - Fixed type error here with as string[]
        const uniqueCategories = [
          ...new Set(data.map((product: Product) => product.category)),
        ] as string[];
        setCategories(uniqueCategories);
      } catch (err) {
        setError("Error loading products. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = () => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default sorting (newest first or featured)
        break;
    }

    return result;
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">All Products</h1>

      {/* Mobile filter toggle */}
      <button
        className="md:hidden flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md mb-4"
        onClick={toggleFilters}
      >
        <FaFilter />
        <span>Filters</span>
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters sidebar */}
        <div
          className={`w-full md:w-1/4 ${
            showFilters ? "block" : "hidden"
          } md:block`}
        >
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="font-semibold text-lg mb-4">Categories</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="all-categories"
                  name="category"
                  checked={selectedCategory === ""}
                  onChange={() => setSelectedCategory("")}
                  className="mr-2"
                />
                <label htmlFor="all-categories">All Categories</label>
              </div>

              {categories.map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    type="radio"
                    id={category}
                    name="category"
                    checked={selectedCategory === category}
                    onChange={() => setSelectedCategory(category)}
                    className="mr-2"
                  />
                  <label htmlFor={category}>{category}</label>
                </div>
              ))}
            </div>

            <h2 className="font-semibold text-lg mt-6 mb-4">Sort By</h2>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>
        </div>

        {/* Products grid */}
        <div className="w-full md:w-3/4">
          {filteredAndSortedProducts().length === 0 ? (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-600">
                No products found. Try changing your filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedProducts().map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="relative h-48 w-full">
                      <Image
                        src={product.imageUrl || "/placeholder-product.jpg"}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-indigo-600 font-bold">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
