// src/components/cart/RemoveItemButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaSpinner } from "react-icons/fa";
import { useCart } from "@/components/providers/CartProvider";

export default function RemoveItemButton({ id }: { id: string }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();
  const { removeItem } = useCart();

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeItem(id);
      router.refresh();
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isRemoving}
      className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
      aria-label="Remove item"
    >
      {isRemoving ? <FaSpinner className="animate-spin" /> : <FaTrash />}
    </button>
  );
}
