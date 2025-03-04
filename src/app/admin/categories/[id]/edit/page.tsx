// src/app/admin/categories/[id]/edit/page.tsx
import { getCategoryById } from "@/app/actions/categoryActions";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import CategoryForm from "../../CategoryForm";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { Metadata, ResolvingMetadata } from "next";

// Define types for category and response
type Category = {
  id: string;
  name: string;
  // Add other category properties as needed
};

// Define the result type from getCategoryById
type CategoryResult =
  | {
      category?: Category;
      error?: string;
    }
  | null
  | undefined;

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const result = (await getCategoryById(params.id)) as unknown as CategoryResult;

  // Check if category exists using proper type checking
  if (!result || "error" in result || !result.category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  return {
    title: `Edit ${result.category.name} | Admin Dashboard`,
    description: `Edit the ${result.category.name} category`,
  };
}

export default async function EditCategoryPage({ params }: Props) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect(`/login?callbackUrl=/admin/categories/${params.id}/edit`);
  }

  const result = (await getCategoryById(params.id)) as unknown as CategoryResult;

  // Check if category exists using proper type checking
  if (!result || "error" in result || !result.category) {
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
        Edit Category: {result.category.name}
      </h1>
      <CategoryForm category={result.category} />
    </div>
  );
}
