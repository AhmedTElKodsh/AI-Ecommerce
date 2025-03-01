// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import {
  FaBox,
  FaList,
  FaShoppingCart,
  FaUsers,
  FaChartBar,
} from "react-icons/fa";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-800 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2 px-4">
            <li>
              <Link
                href="/admin"
                className="flex items-center px-4 py-3 text-white hover:bg-indigo-700 rounded-md"
              >
                <FaChartBar className="mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products"
                className="flex items-center px-4 py-3 text-white hover:bg-indigo-700 rounded-md"
              >
                <FaBox className="mr-3" />
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/admin/categories"
                className="flex items-center px-4 py-3 text-white hover:bg-indigo-700 rounded-md"
              >
                <FaList className="mr-3" />
                Categories
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className="flex items-center px-4 py-3 text-white hover:bg-indigo-700 rounded-md"
              >
                <FaShoppingCart className="mr-3" />
                Orders
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className="flex items-center px-4 py-3 text-white hover:bg-indigo-700 rounded-md"
              >
                <FaUsers className="mr-3" />
                Users
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
