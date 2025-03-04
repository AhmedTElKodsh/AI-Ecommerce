// src/app/page.tsx
import { getProducts } from "@/app/actions/productActions";
import { getCategories } from "@/app/actions/categoryActions";
import Link from "next/link";
import Image from "next/image";
import { FaPlus, FaShoppingCart } from "react-icons/fa";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/auth";

export default async function Home() {
  const { products = [], success: productsSuccess } = await getProducts({});
  const { categories = [], success: categoriesSuccess } = await getCategories();
  const session = await getServerSession(authConfig);
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="bg-indigo-600 text-white rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to ShopNext</h1>
          <p className="text-xl mb-6">Your one-stop shop for all your needs</p>
          <Link
            href="/products"
            className="bg-white text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Categories Section */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Categories</h2>
          <Link
            href="/categories"
            className="text-indigo-600 hover:text-indigo-800"
          >
            View All
          </Link>
        </div>

        {categoriesSuccess && categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">No categories found</h3>
            {isAdmin && (
              <Link
                href="/admin/categories/new"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <FaPlus className="inline mr-2" /> Add Your First Category
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-40">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <h3 className="text-xl font-bold text-white text-center">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link
            href="/products"
            className="text-indigo-600 hover:text-indigo-800"
          >
            View All
          </Link>
        </div>

        {productsSuccess && products.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">No products found</h3>
            {isAdmin && (
              <Link
                href="/admin/products/new"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <FaPlus className="inline mr-2" /> Add Your First Product
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="relative h-48">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0] as string} // Add type assertion to fix the error
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
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
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-indigo-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700"
                      aria-label="Add to cart"
                    >
                      <FaShoppingCart />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
