// src/app/admin/products/new/page.tsx
import { getCategories } from "@/app/actions/categoryActions";
import ProductForm from "../ProductForm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function NewProductPage() {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/products/new");
  }

  const { categories, success, error } = await getCategories();

  if (!success || !categories || categories.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">
            {error ||
              "You need to create at least one category before adding products."}
          </p>
          <a
            href="/admin/categories/new"
            className="text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
          >
            Create a category
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
