// src/app/actions/cartActions.ts
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Get cart from cookies
export async function getCart() {
  try {
    const cartCookie = (await cookies()).get("cart");
    if (!cartCookie?.value) {
      return [];
    }
    return JSON.parse(cartCookie.value);
  } catch (error) {
    console.error("Error parsing cart cookie:", error);
    return [];
  }
}

// Add item to cart
export async function addToCart(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const quantity = parseInt(formData.get("quantity") as string);
    const image = formData.get("image") as string | null;

    if (!id || !name || isNaN(price) || isNaN(quantity)) {
      return { success: false, error: "Invalid item data" };
    }

    const cart = await getCart();

    const existingItemIndex = cart.findIndex((item: any) => item.id === id);

    if (existingItemIndex >= 0) {
      cart[existingItemIndex] = {
        ...cart[existingItemIndex],
        quantity: quantity,
        price: price,
        name: name,
        image: image || cart[existingItemIndex].image,
      };
    } else {
      cart.push({
        id,
        name,
        price,
        quantity,
        image: image || undefined,
      });
    }

    (await cookies()).set("cart", JSON.stringify(cart), { path: "/" });
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

// Update cart item quantity - Modified to accept FormData directly
export async function updateCartItemQuantity(formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const quantity = parseInt(formData.get("quantity") as string);

    if (!id || isNaN(quantity) || quantity < 1) {
      return { success: false, error: "Invalid item data" };
    }

    const cart = await getCart();
    const existingItemIndex = cart.findIndex((item: any) => item.id === id);

    if (existingItemIndex >= 0) {
      cart[existingItemIndex] = {
        ...cart[existingItemIndex],
        quantity: quantity,
      };

      (await cookies()).set("cart", JSON.stringify(cart), { path: "/" });
      revalidatePath("/cart");

      return { success: true };
    } else {
      return { success: false, error: "Item not found in cart" };
    }
  } catch (error) {
    console.error("Error updating item quantity:", error);
    return { success: false, error: "Failed to update item quantity" };
  }
}

// Remove item from cart
export async function removeFromCart(formData: FormData) {
  try {
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "Invalid item ID" };
    }

    const cart = await getCart();
    const updatedCart = cart.filter((item: any) => item.id !== id);

    (await cookies()).set("cart", JSON.stringify(updatedCart), { path: "/" });
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return { success: false, error: "Failed to remove item from cart" };
  }
}

// Clear cart
export async function clearCart() {
  try {
    (await cookies()).set("cart", "[]", { path: "/" });
    revalidatePath("/cart");

    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}
