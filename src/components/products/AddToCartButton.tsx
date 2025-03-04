// src/components/products/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/components/providers/CartProvider";
import { toast } from "react-hot-toast";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock?: number;
    images?: string[];
  };
  className?: string;
}

export default function AddToCartButton({
  product,
  className = "",
}: AddToCartButtonProps) {
  const { addItem, isLoading } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      isAdding ||
      isLoading ||
      (product.stock !== undefined && product.stock <= 0)
    )
      return;

    setIsAdding(true);

    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : undefined,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={
        isAdding ||
        isLoading ||
        (product.stock !== undefined && product.stock <= 0)
      }
      className={`p-2 rounded-full ${
        isAdding ||
        isLoading ||
        (product.stock !== undefined && product.stock <= 0)
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-indigo-600 hover:bg-indigo-700"
      } text-white ${className}`}
      aria-label="Add to cart"
    >
      <FaShoppingCart />
    </button>
  );
}
