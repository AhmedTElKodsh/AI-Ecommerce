// src/app/categories/[id]/page.tsx
import { getCategoryById } from "@/app/actions/categoryActions";
import { getProductsByCategory } from "@/app/actions/productActions";
import { getAllCategories } from "@/app/actions/categoryActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import SortSelector from "@/components/SortSelector";
import PriceFilter from "@/components/PriceFilter";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/products/ProductCard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { category, success } = await getCategoryById(params.id);

  if (!success || !category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `${category.name} | ShopNext`,
    description:
      category.description || `Browse our ${category.name} collection`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: {
    page?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}) {
  const { category, success: categorySuccess } = await getCategoryById(
    params.id
  );

  if (!categorySuccess || !category) {
    notFound();
  }

  // Get all categories for the sidebar filter
  const { categories } = await getAllCategories();

  const page = parseInt(searchParams.page || "1");
  const sort = searchParams.sort || "newest";
  const minPrice = searchParams.minPrice;
  const maxPrice = searchParams.maxPrice;

  // Pass price filters to product search if provided
  const filters: any = {};
  if (minPrice) filters.minPrice = parseFloat(minPrice);
  if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

  const {
    products,
    success: productsSuccess,
    pagination,
  } = await getProductsByCategory(params.id, page, 12, sort, filters);

  const safeProducts = products || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600">{category.description}</p>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left sidebar filter section */}
        <div className="w-full md:w-1/4 lg:w-1/5">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="font-semibold text-lg mb-4">Filters</h2>

            {/* Category filter */}
            <CategoryFilter
              categories={categories || []}
              selectedCategoryId={params.id}
            />

            {/* Price Range Filter */}
            <PriceFilter
              initialMinPrice={minPrice}
              initialMaxPrice={maxPrice}
              categoryId={params.id}
              page={page}
              sort={sort}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Products</h2>
            <SortSelector
              sort={sort}
              categoryId={params.id}
              page={page}
              additionalParams={{
                minPrice: minPrice || "",
                maxPrice: maxPrice || "",
              }}
            />
          </div>

          {!productsSuccess ? (
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
                We don't have any products in this category yet.
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
                      if (minPrice) url.set("minPrice", minPrice);
                      if (maxPrice) url.set("maxPrice", maxPrice);

                      return (
                        <Link
                          key={pageNum}
                          href={`/categories/${params.id}?${url.toString()}`}
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
