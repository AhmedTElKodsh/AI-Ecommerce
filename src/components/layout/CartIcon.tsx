// src/components/layout/CartIcon.tsx
"use client";

import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { useEffect, useState } from "react";
import { getCart } from "@/app/actions/cartActions";

export default function CartIcon() {
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        setIsLoading(true);
        const cartItems = await getCart();
        const count = Array.isArray(cartItems)
          ? cartItems.reduce((sum, item) => sum + Number(item.quantity), 0)
          : 0;
        setItemCount(count);
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartCount();

    // Set up an interval to refresh the cart count every 5 seconds
    const intervalId = setInterval(fetchCartCount, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Link href="/cart" className="relative inline-flex items-center p-2">
      <FaShoppingCart className="h-6 w-6 text-gray-700" />
      {!isLoading && itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
