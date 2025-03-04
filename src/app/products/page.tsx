// src/app/products/page.tsx
import { getAllProducts } from "@/app/actions/productActions";
import { getAllCategories } from "@/app/actions/categoryActions";
import { Metadata } from "next";
import Link from "next/link";
import SortSelector from "@/components/SortSelector";
import PriceFilter from "@/components/PriceFilter";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/products/ProductCard";

export const metadata: Metadata = {
  title: "All Products | ShopNext",
  description: "Browse our collection of products",
};

// Add these directives to ensure dynamic data loading
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    sort?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}) {
  const page = parseInt(searchParams.page || "1");
  const sort = searchParams.sort || "newest";
  const categoryFilter = searchParams.category;
  const minPrice = searchParams.minPrice;
  const maxPrice = searchParams.maxPrice;

  // Get all categories for filter sidebar
  const { categories } = await getAllCategories();

  // Build filters object
  const filters: any = {};
  if (categoryFilter) filters.categoryId = categoryFilter;
  if (minPrice) filters.minPrice = parseFloat(minPrice);
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

  const { products, success, pagination } = await getAllProducts(
    page,
    12,
    sort,
    filters
  );

  const safeProducts = products || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar filter section */}
        <div className="w-full md:w-1/4 lg:w-1/5">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold text-lg mb-4">Filters</h2>

            {/* Category filter */}
            <CategoryFilter
              categories={categories || []}
              selectedCategoryId={categoryFilter}
            />

            {/* Price Range Filter */}
            <PriceFilter
              initialMinPrice={minPrice}
              initialMaxPrice={maxPrice}
              page={page}
              sort={sort}
            />
          </div>
        </div>

        {/* Main content with products */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-600">
              {pagination && (
                <span>
                  Showing {safeProducts.length} of {pagination.total} products
                </span>
              )}
            </div>

            <SortSelector
              sort={sort}
              page={page}
              additionalParams={{
                minPrice: minPrice || "",
                maxPrice: maxPrice || "",
                category: categoryFilter || "",
              }}
            />
          </div>

          {!success ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">
                Error loading products
              </h3>
              <p className="text-gray-600 mb-6">
                There was a problem loading the products. Please try again
                later.
              </p>
            </div>
          ) : safeProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold mb-4">No products found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any products matching your criteria. Try
                adjusting your filters or browse our categories.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {safeProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="inline-flex">
                    {Array.from(
                      { length: pagination.pages },
                      (_, i) => i + 1
                    ).map((pageNum) => {
                      // Create URL with all current parameters
                      const url = new URLSearchParams();
                      url.set("page", pageNum.toString());
                      url.set("sort", sort);
                      if (categoryFilter) url.set("category", categoryFilter);
                      if (minPrice) url.set("minPrice", minPrice);
                      if (maxPrice) url.set("maxPrice", maxPrice);

                      return (
                        <Link
                          key={pageNum}
                          href={`/products?${url.toString()}`}
                          className={`px-4 py-2 border ${
                            pageNum === pagination.current
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
