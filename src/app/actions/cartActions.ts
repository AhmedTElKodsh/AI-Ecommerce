// src/app/actions/cartActions.ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";

// Get cart from cookies
export async function getCart() {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart");

  if (!cartCookie || !cartCookie.value) {
    return [];
  }

  try {
    return JSON.parse(cartCookie.value);
  } catch (error) {
    console.error("Failed to parse cart cookie:", error);
    return [];
  }
}

// Add item to cart
export async function addToCart(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const quantity = parseInt(formData.get("quantity") as string);

    if (!id || isNaN(quantity) || quantity <= 0) {
      return { success: false, error: "Invalid product or quantity" };
    }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        images: true,
      },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        error: `Only ${product.stock} items available`,
      };
    }

    // Get current cart
    const currentCart = await getCart();

    // Check if product already exists in cart
    const existingItemIndex = currentCart.findIndex(
      (item: any) => item.id === id
    );

    let newCart;

    if (existingItemIndex >= 0) {
      // Update quantity if product already exists
      newCart = [...currentCart];
      const newQuantity = newCart[existingItemIndex].quantity + quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > product.stock) {
        return {
          success: false,
          error: `Cannot add ${quantity} more items. Only ${
            product.stock - newCart[existingItemIndex].quantity
          } more available.`,
        };
      }

      newCart[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new product to cart
      newCart = [
        ...currentCart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image:
            product.images && product.images.length > 0
              ? product.images[0]
              : null,
          quantity,
        },
      ];
    }

    // Save cart to cookies
    (await
      // Save cart to cookies
      cookies()).set("cart", JSON.stringify(newCart), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Failed to add item to cart:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const quantity = parseInt(formData.get("quantity") as string);

    if (!id || isNaN(quantity)) {
      return { success: false, error: "Invalid product or quantity" };
    }

    // Get current cart
    const currentCart = await getCart();

    // Find product in cart
    const itemIndex = currentCart.findIndex((item: any) => item.id === id);

    if (itemIndex === -1) {
      return { success: false, error: "Product not found in cart" };
    }

    // If quantity is 0 or less, remove item from cart
    if (quantity <= 0) {
      const newCart = currentCart.filter((item: any) => item.id !== id);
      (await cookies()).set("cart", JSON.stringify(newCart), {
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      revalidatePath("/cart");
      return { success: true };
    }

    // Check if quantity exceeds stock
    const product = await prisma.product.findUnique({
      where: { id },
      select: { stock: true },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    if (product.stock < quantity) {
      return {
        success: false,
        error: `Only ${product.stock} items available`,
      };
    }

    // Update quantity
    const newCart = [...currentCart];
    newCart[itemIndex].quantity = quantity;

    // Save cart to cookies
    (await
      // Save cart to cookies
      cookies()).set("cart", JSON.stringify(newCart), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Failed to update cart item quantity:", error);
    return { success: false, error: "Failed to update cart item quantity" };
  }
}

// Remove item from cart
export async function removeFromCart(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "Invalid product" };
    }

    // Get current cart
    const currentCart = await getCart();

    // Remove product from cart
    const newCart = currentCart.filter((item: any) => item.id !== id);

    // Save cart to cookies
    (await
      // Save cart to cookies
      cookies()).set("cart", JSON.stringify(newCart), {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Failed to remove item from cart:", error);
    return { success: false, error: "Failed to remove item from cart" };
  }
}

// Clear cart
export async function clearCart() {
  try {
    // Save empty cart to cookies
    (await
      // Save empty cart to cookies
      cookies()).set("cart", "[]", {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Failed to clear cart:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}
