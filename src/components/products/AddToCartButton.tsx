// src/components/products/AddToCartButton.tsx
"use client";

import { useState } from "react";
import { FaShoppingCart, FaSpinner, FaCheck } from "react-icons/fa";
import { useCart } from "@/components/providers/CartProvider";

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
};

export default function AddToCartButton({ product }: { product: Product }) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    if (isAdding) return;

    setIsAdding(true);

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image:
          product.images && product.images.length > 0 ? product.images[0] : "",
        quantity: 1,
      });

      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`p-2 rounded-full ${
        isAdded
          ? "bg-green-600 hover:bg-green-700"
          : "bg-indigo-600 hover:bg-indigo-700"
      } text-white transition-colors`}
      aria-label="Add to cart"
    >
      {isAdding ? (
        <FaSpinner className="animate-spin" />
      ) : isAdded ? (
        <FaCheck />
      ) : (
        <FaShoppingCart />
      )}
    </button>
  );
}