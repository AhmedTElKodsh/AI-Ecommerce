// src/app/products/page.tsx
// Remove the unused import
// import { getProducts } from "@/app/actions/productActions";
import { getCategories } from "@/app/actions/categoryActions";
import ProductList from "@/components/products/ProductList";
import ProductFilter from "@/components/products/ProductFilter";
import { Suspense } from "react";
import { FaSearch } from "react-icons/fa";

export const metadata = {
  title: "Products | ShopNext",
  description: "Browse our collection of products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    category?: string;
    search?: string;
    sort?: string;
  };
}) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const { categories } = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Products</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-medium mb-4">Filters</h2>

            {/* Search */}
            <form className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.search || ""}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                >
                  <FaSearch />
                </button>
              </div>
            </form>

            <ProductFilter
              categories={categories || []}
              selectedCategory={searchParams.category}
              selectedSort={searchParams.sort}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="w-full md:w-3/4">
          <Suspense fallback={<div>Loading products...</div>}>
            <ProductList
              page={page}
              category={searchParams.category}
              search={searchParams.search}
              sort={searchParams.sort}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
