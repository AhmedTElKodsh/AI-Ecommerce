// src/components/cart/RemoveItemButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaSpinner } from "react-icons/fa";
import { useCart } from "@/components/providers/CartProvider";

type RemoveItemButtonProps = {
  id: string;
};

export default function RemoveItemButton({ id }: RemoveItemButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();
  const { removeItem } = useCart();

  const handleRemove = async () => {
    setIsRemoving(true);
    
    try {
      removeItem(id);
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
      className="text-red-600 hover:text-red-800 disabled:opacity-50"
      aria-label="Remove item"
    >
      {isRemoving ? <FaSpinner className="animate-spin" /> : <FaTrash />}
    </button>
  );
}