// src/app/admin/categories/[id]/edit/page.tsx
import { getCategories } from "@/app/actions/categoryActions";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import CategoryForm from "../../CategoryForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { category, success } = await getCategories(params.id);

  if (!success || !category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `Edit ${category.name} | Admin Dashboard`,
    description: `Edit the ${category.name} category`,
  };
}

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect(`/login?callbackUrl=/admin/categories/${params.id}/edit`);
  }

  const { category, success } = await getCategories(params.id);

  if (!success || !category) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Categories
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">
        Edit Category: {category.name}
      </h1>
      <CategoryForm category={category} />
    </div>
  );
}
