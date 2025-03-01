// src/app/admin/users/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { FaEnvelope, FaUserEdit, FaTrash } from "react-icons/fa";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export const metadata = {
  title: "User Management | Admin Dashboard",
  description: "Manage users of your store",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/users");
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const search = searchParams.search || "";
  const limit = 10;
  const skip = (page - 1) * limit;

  // Build where clause for search
  let where: Prisma.UserWhereInput = {};

  if (search) {
    where = {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  // Fetch users with pagination
  const users = await prisma.user.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          orders: true,
        },
      },
    },
  });

  // Get total count for pagination
  const totalCount = await prisma.user.count({ where });
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              placeholder="Search users by name or email..."
              defaultValue={search}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name || "No Name"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user._count.orders}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link
                          href={`/admin/users/${user.id}/orders`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Orders"
                        >
                          <FaEnvelope />
                        </Link>
                        <Link
                          href={`/admin/users/${user.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit User"
                        >
                          <FaUserEdit />
                        </Link>
                        {/* Don't allow deleting the current admin user */}
                        {user.id !== session.user.id && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                            onClick={() => {
                              // This would be replaced with a proper delete confirmation modal
                              alert("Delete user functionality would go here");
                            }}
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found
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
                of <span className="font-medium">{totalCount}</span> users
              </p>
            </div>
            <div className="flex space-x-2">
              {page > 1 && (
                <Link
                  href={`/admin/users?page=${page - 1}${
                    search ? `&search=${search}` : ""
                  }`}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/users?page=${page + 1}${
                    search ? `&search=${search}` : ""
                  }`}
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
