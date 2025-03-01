// src/components/cart/CartItemForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { updateCartItemQuantity } from "@/app/actions/cartActions";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

export default function CartItemForm({ item }: { item: CartItem }) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
      updateQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
    updateQuantity(quantity + 1);
  };

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity === item.quantity) return;

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("id", item.id);
      formData.append("quantity", newQuantity.toString());

      await updateCartItemQuantity(formData);
      router.refresh();
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={decreaseQuantity}
        disabled={isUpdating || quantity <= 1}
        className="p-2 border border-gray-300 rounded-l-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        -
      </button>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={handleQuantityChange}
        onBlur={() => updateQuantity(quantity)}
        disabled={isUpdating}
        className="w-12 text-center p-2 border-y border-gray-300 focus:outline-none disabled:opacity-50"
      />
      <button
        type="button"
        onClick={increaseQuantity}
        disabled={isUpdating}
        className="p-2 border border-gray-300 rounded-r-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        aria-label="Increase quantity"
      >
        +
      </button>

      {isUpdating && (
        <span className="ml-2">
          <FaSpinner className="animate-spin text-indigo-600" />
        </span>
      )}
    </div>
  );
}
