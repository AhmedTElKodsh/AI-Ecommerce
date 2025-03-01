// src/components/products/ProductList.tsx
import { getProducts } from "@/app/actions/productActions";
import Link from "next/link";
import Image from "next/image";
import { FaShoppingCart } from "react-icons/fa";
import AddToCartButton from "@/components/products/AddToCartButton";
import Pagination from "@/components/ui/Pagination";

export default async function ProductList({
  page = 1,
  category,
  search,
  sort,
}: {
  page: number;
  category?: string;
  search?: string;
  sort?: string;
}) {
  const { products, pagination, success } = await getProducts({
    page,
    limit: 12,
    categoryId: category, // Change 'category' to 'categoryId'
    search,
    sort,
  });

  if (!success || !products || products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <h3 className="text-xl font-semibold mb-4">No products found</h3>
        <p className="text-gray-600">
          {search
            ? `No products match "${search}"`
            : "Try adjusting your filters or check back later."}
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
              <div className="relative h-48">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
              </div>
            </Link>
            <div className="p-4">
              <Link href={`/products/${product.id}`}>
                <h3 className="text-lg font-semibold mb-2 hover:text-indigo-600">
                  {product.name}
                </h3>
              </Link>
              
              {product.category && (
                <Link 
                  href={`/products?category=${product.category.id}`}
                  className="text-sm text-indigo-600 hover:underline mb-2 inline-block"
                >
                  {product.category.name}
                </Link>
              )}
              
              <p className="text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>
              
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
      
      {pagination && pagination.pages > 1 && (
        <div className="mt-8">
          <Pagination 
            currentPage={pagination.current} 
            totalPages={pagination.pages}
            baseUrl={`/products?${new URLSearchParams({
              ...(category ? { category } : {}),
              ...(search ? { search } : {}),
              ...(sort ? { sort } : {})
            }).toString()}`}
          />
        </div>
      )}
    </div>
  );
}