// src/app/admin/users/[id]/orders/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { FaArrowLeft, FaEye } from "react-icons/fa";
import prisma from "@/lib/db";

export default async function UserOrdersPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect(`/login?callbackUrl=/admin/users/${params.id}/orders`);
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    notFound();
  }

  // Get user orders
  const orders = await prisma.order.findMany({
    where: { userId: params.id },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  // Get total count for pagination
  const totalCount = await prisma.order.count({
    where: { userId: params.id },
  });
  const totalPages = Math.ceil(totalCount / limit);

  // Define status badge colors
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Users
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Orders for {user.name || user.email}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">User Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name:</p>
            <p className="font-medium">{user.name || "Not provided"}</p>
          </div>
          <div>
            <p className="text-gray-600">Email:</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {order.id.slice(-6)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {order._count.items}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <FaEye />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No orders found for this user
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * limit, totalCount)}
                </span>{" "}
                of <span className="font-medium">{totalCount}</span> orders
              </p>
            </div>
            <div className="flex space-x-2">
              {page > 1 && (
                <Link
                  href={`/admin/users/${params.id}/orders?page=${page - 1}`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/users/${params.id}/orders?page=${page + 1}`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
