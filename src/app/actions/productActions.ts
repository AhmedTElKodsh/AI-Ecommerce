// src/app/actions/productActions.ts
"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// Define an interface for the filters object
interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

// Get products with filtering, sorting, and pagination
export async function getProducts({
  page = 1,
  limit = 10,
  categoryId,
  search,
  sort = "newest",
  minPrice,
  maxPrice,
}: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
} = {}) {
  try {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Filter by category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Determine sort order
    let orderBy: any = { createdAt: "desc" }; // default: newest
    switch (sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "rating":
        orderBy = { avgRating: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
          },
        },
      },
    });

    // Calculate average rating for each product
    const productsWithAvgRating = products.map((product) => {
      const reviews = product.reviews || [];
      const avgRating =
        reviews.length > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length
          : 0;
      return {
        ...product,
        avgRating,
      };
    });

    // Get total count for pagination
    const totalCount = await prisma.product.count({ where });

    return {
      success: true,
      products: productsWithAvgRating,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
      },
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}

export async function getAllProducts(
  page = 1,
  limit = 12,
  sort = "newest",
  filters: ProductFilters = {}
) {
  try {
    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause from filters
    const where: any = {};

    // Category filter
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    // Price filters
    if (filters.minPrice !== undefined) {
      where.price = {
        ...(where.price || {}),
        gte: filters.minPrice,
      };
    }

    if (filters.maxPrice !== undefined) {
      where.price = {
        ...(where.price || {}),
        lte: filters.maxPrice,
      };
    }

    // Rest of the function remains the same
    // Determine sort order
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };
    if (sort === "name_asc") orderBy = { name: "asc" };
    if (sort === "name_desc") orderBy = { name: "desc" };

    // Get total count with filters
    const totalProducts = await prisma.product.count({ where });

    // Get products
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: true,
      },
    });

    // Calculate average ratings
    const productsWithRatings = products.map((product) => {
      let avgRating = 0;
      if (product.reviews.length > 0) {
        avgRating =
          product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length;
      }
      return {
        ...product,
        avgRating,
      };
    });

    return {
      success: true,
      products: productsWithRatings,
      pagination: {
        total: totalProducts,
        pages: Math.ceil(totalProducts / limit),
        current: page,
      },
    };
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return { success: false, products: [], error: "Failed to fetch products" };
  }
}

export async function getProductsByCategory(
  categoryId: string,
  page = 1,
  limit = 12,
  sort = "newest",
  filters: ProductFilters = {}
) {
  try {
    // Build filters including the category
    const categoryFilters: ProductFilters = {
      ...filters,
      categoryId: categoryId,
    };

    // Reuse the getAllProducts function with category filter
    return await getAllProducts(page, limit, sort, categoryFilters);
  } catch (error) {
    console.error("Failed to fetch category products:", error);
    return {
      success: false,
      products: [],
      error: "Failed to fetch category products",
    };
  }
}

// Get product by ID
export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                // Removed 'image' field which doesn't exist in the User model
                // If you have a user image field with a different name, use that instead
                // For example: avatar: true, or profilePicture: true
              },
            },
          },
        },
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Calculate average rating if there are reviews
    let avgRating = 0;
    if (product.reviews.length > 0) {
      avgRating =
        product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length;
    }

    return {
      success: true,
      product: {
        ...product,
        avgRating,
      },
    };
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return { success: false, error: "Failed to fetch product" };
  }
}

// Create a new product (admin only)
export async function createProduct(formData: FormData) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const categoryId = formData.get("categoryId") as string;
    const images = formData.getAll("images") as string[];

    if (!name || !description || isNaN(price) || isNaN(stock) || !categoryId) {
      return { success: false, error: "All fields are required" };
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        images,
      },
    });

    // Revalidate paths
    revalidatePath("/products");
    revalidatePath("/admin/products");
    revalidatePath(`/categories/${categoryId}`);

    return { success: true, product };
  } catch (error) {
    console.error("Failed to create product:", error);
    return { success: false, error: "Failed to create product" };
  }
}

// Update a product (admin only)
export async function updateProduct(formData: FormData) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string);
    const categoryId = formData.get("categoryId") as string;
    const images = formData.getAll("images") as string[];

    if (
      !id ||
      !name ||
      !description ||
      isNaN(price) ||
      isNaN(stock) ||
      !categoryId
    ) {
      return { success: false, error: "All fields are required" };
    }

    // Get current product to check for category change
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });

    if (!currentProduct) {
      return { success: false, error: "Product not found" };
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        images,
      },
    });

    // Revalidate paths
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}`);

    // Revalidate category pages if category changed
    if (currentProduct.categoryId !== categoryId) {
      revalidatePath(`/categories/${currentProduct.categoryId}`);
      revalidatePath(`/categories/${categoryId}`);
    }

    return { success: true, product };
  } catch (error) {
    console.error("Failed to update product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

// Delete a product (admin only)
export async function deleteProduct(formData: FormData) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "Product ID is required" };
    }

    // Get the current product to check category
    const product = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true },
    });

    // Check if product is in any orders
    const orderItems = await prisma.orderItem.findMany({
      where: { productId: id },
    });

    if (orderItems.length > 0) {
      // Instead of preventing deletion, mark as out of stock
      await prisma.product.update({
        where: { id },
        data: { stock: 0 },
      });

      // Revalidate relevant paths
      revalidatePath("/products");
      revalidatePath(`/products/${id}`);
      revalidatePath("/admin/products");
      if (product?.categoryId) {
        revalidatePath(`/categories/${product.categoryId}`);
      }

      return {
        success: true,
        message:
          "Product has been marked as out of stock because it has existing orders.",
      };
    }

    // Delete product
    await prisma.product.delete({
      where: { id },
    });

    // Revalidate relevant paths
    revalidatePath("/products");
    revalidatePath("/admin/products");
    if (product?.categoryId) {
      revalidatePath(`/categories/${product.categoryId}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}
