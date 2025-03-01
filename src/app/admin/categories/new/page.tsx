// src/app/admin/categories/new/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CategoryForm from "../CategoryForm";

export default async function NewCategoryPage() {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin/categories/new");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add New Category</h1>
      <CategoryForm />
    </div>
  );
}
