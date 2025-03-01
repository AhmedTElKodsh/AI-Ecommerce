// src/components/cart/ClearCartButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaSpinner } from "react-icons/fa";
import { clearCart } from "@/app/actions/cartActions";

export default function ClearCartButton() {
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleClearCart = async () => {
    setIsClearing(true);
    try {
      await clearCart();
      router.refresh();
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setIsClearing(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isClearing}
        className="text-red-600 hover:text-red-800 flex items-center disabled:opacity-50"
      >
        <FaTrash className="mr-1" /> Clear Cart
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Clear Cart</h3>
            <p className="mb-6">
              Are you sure you want to remove all items from your cart?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isClearing}
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Clearing...
                  </>
                ) : (
                  "Clear Cart"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
