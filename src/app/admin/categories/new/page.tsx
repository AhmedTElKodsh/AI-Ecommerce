// src/app/admin/categories/new/page.tsx
import { getServerAuthSession } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import CategoryForm from "@/components/CategoryForm";

// Add these directives to prevent static prerendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewCategoryPage() {
  // Get the user session
  const session = await getServerAuthSession();

  // Check admin authorization
  if (!session || !session.user || session.user.role !== "admin") {
    redirect("/login");
  }

  try {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Create New Category</h1>
        <CategoryForm />
      </div>
    );
  } catch (error) {
    console.error("Error in new category page:", error);
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Create New Category</h1>
        <div className="text-red-600">
          An error occurred. Please try again later.
        </div>
      </div>
    );
  }
}
