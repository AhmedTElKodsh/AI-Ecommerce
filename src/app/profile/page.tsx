// src/app/profile/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { FaUser, FaShoppingBag, FaHeart, FaCog } from "react-icons/fa";
import { getOrders } from "@/app/actions/orderActions";
import prisma from "@/lib/db";

export const metadata = {
  title: "My Profile | ShopNext",
  description: "Manage your account and view your orders",
};

export default async function ProfilePage() {
  const session = await auth();

  // Check if user is authenticated
  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  // Get recent orders
  const { orders = [], success } = await getOrders({
    userId: session.user.id,
    limit: 3,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <FaUser size={24} />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{user.name || "User"}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md"
              >
                <FaUser className="mr-3" /> Account Overview
              </Link>
              <Link
                href="/orders"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <FaShoppingBag className="mr-3" /> My Orders
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <FaHeart className="mr-3" /> Wishlist
              </Link>
              <Link
                href="/profile/settings"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <FaCog className="mr-3" /> Account Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Account Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-600 mb-1">Total Orders</p>
                <p className="text-2xl font-bold">{user._count.orders || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-600 mb-1">Member Since</p>
                <p className="text-2xl font-bold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Link
                href="/orders"
                className="text-indigo-600 hover:text-indigo-800"
              >
                View All
              </Link>
            </div>

            {orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {order.id.slice(-6)}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              order.status === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${order.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">
                  You haven't placed any orders yet.
                </p>
                <Link
                  href="/products"
                  className="inline-block bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
