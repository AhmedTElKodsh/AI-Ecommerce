// src/components/cart/CartItemForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/providers/CartProvider";

type CartItemProps = {
  item: {
    id: string;
    quantity: number;
  };
};

export default function CartItemForm({ item }: CartItemProps) {
  const router = useRouter();
  const { updateItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };

  const handleUpdateQuantity = async () => {
    if (quantity === item.quantity) return;
    
    setIsUpdating(true);
    
    try {
      updateItemQuantity(item.id, quantity);
      router.refresh();
    } catch (error) {
      console.error("Failed to update cart item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center">
      <div className="flex items-center border border-gray-300 rounded-md">
        <button
          type="button"
          onClick={() => {
            if (quantity > 1) {
              setQuantity(quantity - 1);
              updateItemQuantity(item.id, quantity - 1);
              router.refresh();
            }
          }}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
          disabled={isUpdating || quantity <= 1}
        >
          -
        </button>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={handleQuantityChange}
          onBlur={handleUpdateQuantity}
          className="w-12 px-2 py-1 text-center border-x border-gray-300 focus:outline-none"
          disabled={isUpdating}
        />
        <button
          type="button"
          onClick={() => {
            setQuantity(quantity + 1);
            updateItemQuantity(item.id, quantity + 1);
            router.refresh();
          }}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100"
          disabled={isUpdating}
        >
          +
        </button>
      </div>
    </div>
  );
}