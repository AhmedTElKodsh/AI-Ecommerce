// src/app/categories/[id]/page.tsx
import { getCategoryById } from "@/app/actions/categoryActions";
import { getProducts } from "@/app/actions/productActions";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaStar } from "react-icons/fa";

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
      category.description ||
      `Browse our collection of ${category.name} products`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string; sort?: string };
}) {
  const {
    category,
    success: categorySuccess,
    error: categoryError,
  } = await getCategoryById(params.id);

  if (!categorySuccess || !category) {
    notFound();
  }

  // Parse search params
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const sort = searchParams.sort || "newest";

  // Fetch products in this category
  const {
    products = [],
    pagination,
    success: productsSuccess,
    error: productsError,
  } = await getProducts({
    page,
    limit: 12,
    categoryId: params.id,
    sort,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/categories"
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Categories
        </Link>
      </div>

      {/* Category Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="relative h-64 md:h-80">
          {category.image ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
              No image available
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
              {category.name}
            </h1>
          </div>
        </div>

        {category.description && (
          <div className="p-6 border-t border-gray-200">
            <p className="text-gray-700">{category.description}</p>
          </div>
        )}
      </div>

      {/* Products Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Products</h2>

          {/* Sort Dropdown */}
          <div>
            <form className="flex items-center">
              <label htmlFor="sort" className="mr-2 text-gray-600">
                Sort by:
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={sort}
                onChange={(e) => {
                  const form = e.target.form;
                  if (form) form.submit();
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </form>
          </div>
        </div>

        {productsError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{productsError}</p>
          </div>
        )}

        {productsSuccess && products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">No products found</h3>
            <p className="text-gray-600 mb-6">
              We don't have any products in this category yet.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative aspect-square">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                        No image
                      </div>
                    )}
                    {product.stock <= 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Out of Stock
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        <FaStar />
                        <span className="ml-1 text-gray-600">
                          {/* Fixed: Check for reviews length instead of _count */}
                          {product.reviews && product.reviews.length > 0
                            ? product.avgRating?.toFixed(1) || "4.0"
                            : "No reviews"}
                        </span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-indigo-600">
                      ${product.price.toFixed(2)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  {pagination.current > 1 && (
                    <Link
                      href={`/categories/${params.id}?page=${
                        pagination.current - 1
                      }${sort ? `&sort=${sort}` : ""}`}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}

                  {/* Page numbers */}
                  <div className="flex space-x-2">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(
                        (p) =>
                          p === 1 ||
                          p === pagination.pages ||
                          Math.abs(p - pagination.current) <= 1
                      )
                      .map((p, i, arr) => {
                        // Add ellipsis
                        if (i > 0 && p - arr[i - 1] > 1) {
                          return (
                            <span
                              key={`ellipsis-${p}`}
                              className="px-4 py-2 border border-gray-300 rounded-md text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }

                        return (
                          <Link
                            key={p}
                            href={`/categories/${params.id}?page=${p}${
                              sort ? `&sort=${sort}` : ""
                            }`}
                            className={`px-4 py-2 border rounded-md ${
                              p === pagination.current
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {p}
                          </Link>
                        );
                      })}
                  </div>

                  {pagination.current < pagination.pages && (
                    <Link
                      href={`/categories/${params.id}?page=${
                        pagination.current + 1
                      }${sort ? `&sort=${sort}` : ""}`}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
