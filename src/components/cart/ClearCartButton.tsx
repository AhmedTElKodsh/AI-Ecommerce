// src/components/cart/ClearCartButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaSpinner } from "react-icons/fa";
import { useCart } from "@/components/providers/CartProvider";

export default function ClearCartButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { clearCart } = useCart();

  const handleClearCart = async () => {
    setIsClearing(true);
    
    try {
      clearCart();
      router.refresh();
      setShowConfirm(false);
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
          onClick={handleClearCart}
          disabled={isClearing}
          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
        >
          {isClearing ? (
            <FaSpinner className="animate-spin" />
          ) : (
            "Confirm"
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-gray-600 hover:text-red-600 text-sm font-medium flex items-center"
    >
      <FaTrash className="mr-1" /> Clear Cart
    </button>
  );
}