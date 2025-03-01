// src/app/admin/products/[id]/edit/page.tsx
import { getProductById } from "@/app/actions/productActions";
import { getCategories } from "@/app/actions/categoryActions";
import ProductForm from "../../ProductForm";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect(`/login?callbackUrl=/admin/products/${params.id}/edit`);
  }

  const {
    product,
    success: productSuccess,
    error: productError,
  } = await getProductById(params.id);
  const {
    categories,
    success: categoriesSuccess,
    error: categoriesError,
  } = await getCategories();

  if (!productSuccess || !product) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{productError || "Product not found"}</p>
        </div>
      </div>
    );
  }

  if (!categoriesSuccess || !categories || categories.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <p className="text-yellow-700">
            {categoriesError ||
              "No categories found. You need at least one category."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <ProductForm categories={categories} product={product} isEdit={true} />
    </div>
  );
}
