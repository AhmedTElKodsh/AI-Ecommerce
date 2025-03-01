// app/admin/categories/page.tsx
import { getCategories } from "@/app/actions/categoryActions";
import Link from "next/link";
import Image from "next/image";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import DeleteCategoryButton from "./DeleteCategoryButton";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Categories | Admin Dashboard",
  description: "Manage your store's categories",
};

export default async function AdminCategoriesPage() {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/categories");
  }

  const { categories = [], success, error } = await getCategories();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
        >
          <FaPlus className="mr-2" /> Add Category
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No categories found</h2>
          <p className="text-gray-600 mb-6">
            Start by adding your first category.
          </p>
          <Link
            href="/admin/categories/new"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add Your First Category
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-12 h-12 relative">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          sizes="48px"
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-2">
                      {category.description || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link
                        href={`/admin/categories/${category.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Category"
                      >
                        <FaEdit />
                      </Link>
                      <DeleteCategoryButton
                        id={category.id}
                        name={category.name}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
