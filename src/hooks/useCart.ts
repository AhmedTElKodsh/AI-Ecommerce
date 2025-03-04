// src/hooks/useCart.ts
"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

export function useCart() {
  const cartStore = useCartStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // This ensures the cart is only accessed client-side
    setIsLoaded(true);
  }, []);

  // Return empty array if not loaded (server-side)
  return {
    cartItems: isLoaded ? cartStore.items : [],
    addToCart: cartStore.addItem,
    removeFromCart: cartStore.removeItem,
    updateQuantity: cartStore.updateQuantity,
    clearCart: cartStore.clearCart,
    totalItems: isLoaded
      ? cartStore.items.reduce((sum: any, item: { quantity: any; }) => sum + item.quantity, 0)
      : 0,
    totalPrice: isLoaded
      ? cartStore.items.reduce(
          (sum: number, item: { price: number; quantity: number; }) => sum + item.price * item.quantity,
          0
        )
      : 0,
  };
}
