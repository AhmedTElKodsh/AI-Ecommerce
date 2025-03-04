// src/components/cart/ClearCartButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { useCart } from "@/components/providers/CartProvider";

export default function ClearCartButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { clearCart } = useCart();

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      setShowConfirm(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setIsClearing(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isClearing}
          className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 text-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleClearCart}
          disabled={isClearing}
          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isClearing ? <FaSpinner className="animate-spin" /> : "Confirm"}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-500 hover:text-red-700 transition-colors text-sm"
    >
      Clear Cart
    </button>
  );
}
