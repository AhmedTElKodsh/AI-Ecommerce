// src / components / products / ProductList.tsx;
import { getProducts } from "@/app/actions/productActions";
import Link from "next/link";
import Image from "next/image";
import { FaStar, FaShoppingCart } from "react-icons/fa";
import AddToCartButton from "@/components/products/AddToCartButton";

interface ProductListProps {
  page: number;
  category?: string;
  search?: string;
  sort?: string;
}

export default async function ProductList({
  page = 1,
  category,
  search,
  sort = "newest",
}: ProductListProps) {
  const {
    products = [],
    pagination,
    success,
    error,
  } = await getProducts({
    page,
    limit: 12,
    categoryId: category,
    search,
    sort,
  });

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (success && products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-xl font-semibold mb-4">No products found</h3>
        <p className="text-gray-600 mb-6">
          {search
            ? `No products match "${search}"`
            : "We couldn't find any products matching your criteria."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <Link href={`/products/${product.id}`}>
              <div className="relative aspect-square">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0] || "/images/placeholder.jpg"} // Added fallback image
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
            </Link>
            <div className="p-4">
              <Link href={`/products/${product.id}`}>
                <h3 className="text-lg font-semibold mb-2 line-clamp-1 hover:text-indigo-600">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  <FaStar />
                  <span className="ml-1 text-gray-600">
                    {product.reviews && product.reviews.length > 0
                      ? product.avgRating?.toFixed(1) || "4.0"
                      : "No reviews"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-indigo-600">
                  ${product.price.toFixed(2)}
                </span>
                <AddToCartButton product={product} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex space-x-2">
            {pagination.current > 1 && (
              <Link
                href={`/products?page=${pagination.current - 1}${
                  category ? `&category=${category}` : ""
                }${sort ? `&sort=${sort}` : ""}${
                  search ? `&search=${search}` : ""
                }`}
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
                  // Add ellipsis with check to prevent undefined access
                  if (
                    i > 0 &&
                    arr[i - 1] !== undefined &&
                    p - arr[i - 1]! > 1
                  ) {
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
                      href={`/products?page=${p}${
                        category ? `&category=${category}` : ""
                      }${sort ? `&sort=${sort}` : ""}${
                        search ? `&search=${search}` : ""
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
                href={`/products?page=${pagination.current + 1}${
                  category ? `&category=${category}` : ""
                }${sort ? `&sort=${sort}` : ""}${
                  search ? `&search=${search}` : ""
                }`}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
