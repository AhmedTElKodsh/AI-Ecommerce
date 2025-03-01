// src/app/actions/categoryActions.ts
import db from "@/lib/db";

// Modified to make the id parameter optional
export async function getCategories(id?: string) {
  try {
    if (id) {
      // Get specific category when ID is provided
      const category = await db.category.findUnique({
        where: { id },
      });

      return {
        success: true,
        category,
        categories: category ? [category] : [],
      };
    } else {
      // Get all categories when no ID is provided
      const categories = await db.category.findMany({
        orderBy: { name: "asc" },
      });

      return {
        success: true,
        categories,
      };
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      categories: [],
      error: "Failed to fetch categories",
    };
  }
}

// Added missing createCategory function
export async function createCategory(data: {
  name: string;
  description?: string | null;
  image?: string | null;
}) {
  try {
    const category = await db.category.create({
      data: {
        name: data.name,
        description: data.description || null,
        image: data.image || null,
      },
    });

    return {
      success: true,
      category,
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: "Failed to create category",
    };
  }
}

// Added missing updateCategory function
export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    image?: string | null;
  }
) {
  try {
    const category = await db.category.update({
      where: { id },
      data,
    });

    return {
      success: true,
      category,
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: "Failed to update category",
    };
  }
}

// Added missing deleteCategory function
export async function deleteCategory(id: string) {
  try {
    await db.category.delete({
      where: { id },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: "Failed to delete category",
    };
  }
}
