// src/app/admin/orders/page.tsx
import Link from "next/link";
import { getOrders } from "@/app/actions/orderActions";
import { FaEye } from "react-icons/fa";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Orders | Admin Dashboard",
  description: "Manage your store's orders",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/orders");
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const status = searchParams.status || "";

  const {
    orders = [],
    pagination,
    success,
    error,
  } = await getOrders({
    page,
    limit: 10,
    status: status || undefined,
  });

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

  // Define payment status badge colors
  const getPaymentStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "PENDING":
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/orders"
            className={`px-4 py-2 rounded-md text-sm ${
              !status
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            All
          </Link>
          <Link
            href="/admin/orders?status=PENDING"
            className={`px-4 py-2 rounded-md text-sm ${
              status === "PENDING"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Pending
          </Link>
          <Link
            href="/admin/orders?status=PROCESSING"
            className={`px-4 py-2 rounded-md text-sm ${
              status === "PROCESSING"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Processing
          </Link>
          <Link
            href="/admin/orders?status=SHIPPED"
            className={`px-4 py-2 rounded-md text-sm ${
              status === "SHIPPED"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Shipped
          </Link>
          <Link
            href="/admin/orders?status=COMPLETED"
            className={`px-4 py-2 rounded-md text-sm ${
              status === "COMPLETED"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Completed
          </Link>
          <Link
            href="/admin/orders?status=CANCELLED"
            className={`px-4 py-2 rounded-md text-sm ${
              status === "CANCELLED"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            Cancelled
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No orders found</h2>
          <p className="text-gray-600">
            {status
              ? `No orders with status "${status}"`
              : "No orders have been placed yet."}
          </p>
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
                      Order ID
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Payment
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
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
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(-6)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(order.createdAt.toString())}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.user ? order.user.name : "Guest"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user ? order.user.email : "No email available"}
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeColor(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${order.total.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end"
                        >
                          <FaEye className="mr-1" /> View
                        </Link>
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
                    href={`/admin/orders?page=${pagination.current - 1}${
                      status ? `&status=${status}` : ""
                    }`}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(
                    (pageNum) =>
                      pageNum === 1 ||
                      pageNum === pagination.pages ||
                      Math.abs(pageNum - pagination.current) <= 1
                  )
                  .map((pageNum, i, filteredPages) => {
                    // Add ellipsis
                    if (i > 0 && filteredPages[i] - filteredPages[i - 1] > 1) {
                      return (
                        <span
                          key={`ellipsis-${pageNum}`}
                          className="px-3 py-1 text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <Link
                        key={pageNum}
                        href={`/admin/orders?page=${pageNum}${
                          status ? `&status=${status}` : ""
                        }`}
                        className={`px-3 py-1 border rounded-md text-sm ${
                          pageNum === pagination.current
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}

                {pagination.current < pagination.pages && (
                  <Link
                    href={`/admin/orders?page=${pagination.current + 1}${
                      status ? `&status=${status}` : ""
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
