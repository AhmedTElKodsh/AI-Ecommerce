// src/app/admin/products/page.tsx
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/app/actions/productActions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import DeleteProductButton from "../categories/DeleteCategoryButton";

export const metadata = {
  title: "Product Management | Admin Dashboard",
  description: "Manage your store's products",
};

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/products");
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const search = searchParams.search || "";

  const {
    products = [],
    pagination,
    success,
    error,
  } = await getProducts({
    page,
    limit: 10,
    search,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Link
          href="/admin/products/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <FaPlus className="mr-2" /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form className="flex">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search products..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700"
          >
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No products found</h2>
          <p className="text-gray-600 mb-6">
            {search
              ? `No products match "${search}"`
              : "Start by adding your first product."}
          </p>
          <Link
            href="/admin/products/new"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <FaPlus className="inline mr-2" /> Add Your First Product
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 relative">
                            {product.images && product.images.length > 0 ? (
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover rounded-md"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-xs">
                                No img
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {product.category?.name || "Uncategorized"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${product.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock > 0 ? product.stock : "Out of stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </Link>
                          <DeleteProductButton
                            id={product.id}
                            name={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center space-x-2">
                {pagination.current > 1 && (
                  <Link
                    href={`/admin/products?page=${pagination.current - 1}${
                      search ? `&search=${search}` : ""
                    }`}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}

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
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-400"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <Link
                        key={p}
                        href={`/admin/products?page=${p}${
                          search ? `&search=${search}` : ""
                        }`}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          p === pagination.current
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}

                {pagination.current < pagination.pages && (
                  <Link
                    href={`/admin/products?page=${pagination.current + 1}${
                      search ? `&search=${search}` : ""
                    }`}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
}
