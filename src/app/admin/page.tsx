// src/app/admin/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FaBox,
  FaList,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaPlus,
} from "react-icons/fa";
import prisma from "@/lib/db";

export const metadata = {
  title: "Admin Dashboard | ShopNext",
  description: "Manage your e-commerce store",
};

export default async function AdminDashboardPage() {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  // Fetch dashboard data
  const productsCount = await prisma.product.count();
  const categoriesCount = await prisma.category.count();
  const ordersCount = await prisma.order.count();
  const usersCount = await prisma.user.count();

  // Get recent orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Get low stock products
  const lowStockProducts = await prisma.product.findMany({
    where: {
      stock: {
        lte: 5,
      },
    },
    take: 5,
    orderBy: {
      stock: "asc",
    },
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <FaBox />
            </div>
            <div>
              <p className="text-sm text-gray-500">Products</p>
              <p className="text-2xl font-semibold">{productsCount}</p>
            </div>
          </div>
          <Link
            href="/admin/products"
            className="text-indigo-600 hover:text-indigo-800 text-sm mt-4 inline-block"
          >
            View all products
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <FaList />
            </div>
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-semibold">{categoriesCount}</p>
            </div>
          </div>
          <Link
            href="/admin/categories"
            className="text-indigo-600 hover:text-indigo-800 text-sm mt-4 inline-block"
          >
            View all categories
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FaShoppingCart />
            </div>
            <div>
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-2xl font-semibold">{ordersCount}</p>
            </div>
          </div>
          <Link
            href="/admin/orders"
            className="text-indigo-600 hover:text-indigo-800 text-sm mt-4 inline-block"
          >
            View all orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <FaUsers />
            </div>
            <div>
              <p className="text-sm text-gray-500">Users</p>
              <p className="text-2xl font-semibold">{usersCount}</p>
            </div>
          </div>
          <Link
            href="/admin/users"
            className="text-indigo-600 hover:text-indigo-800 text-sm mt-4 inline-block"
          >
            View all users
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/products/new"
            className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
              <FaPlus />
            </div>
            <span>Add Product</span>
          </Link>

          <Link
            href="/admin/categories/new"
            className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
              <FaPlus />
            </div>
            <span>Add Category</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
              <FaShoppingCart />
            </div>
            <span>Manage Orders</span>
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
              <FaChartLine />
            </div>
            <span>View Analytics</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-500">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          #{order.id.slice(-6)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {order.user ? order.user.name : "Guest"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : order.status === "PROCESSING"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "SHIPPED"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        ${order.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Link
              href="/admin/orders"
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              View all orders
            </Link>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Low Stock Products</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500">No low stock products</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lowStockProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.stock === 0
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of stock"
                            : `${product.stock} left`}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        ${product.price.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Link
              href="/admin/products"
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              View all products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
