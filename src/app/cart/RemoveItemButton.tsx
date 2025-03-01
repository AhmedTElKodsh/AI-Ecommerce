// src/components/cart/RemoveItemButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaSpinner } from "react-icons/fa";
import { removeFromCart } from "@/app/actions/cartActions";

export default function RemoveItemButton({ id }: { id: string }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const formData = new FormData();
      formData.append("id", id);

      await removeFromCart(formData);
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
      className="text-red-600 hover:text-red-800 flex items-center disabled:opacity-50"
      aria-label="Remove item"
    >
      {isRemoving ? (
        <FaSpinner className="animate-spin" />
      ) : (
        <>
          <FaTrash className="mr-1" /> Remove
        </>
      )}
    </button>
  );
}
