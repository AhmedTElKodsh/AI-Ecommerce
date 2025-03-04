// src/app/products/[id]/AddToCartForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaShoppingCart, FaSpinner, FaCheck } from "react-icons/fa";

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
};

export default function AddToCartForm({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const router = useRouter();

  // Reset the added state after 2 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAdded) {
      timer = setTimeout(() => {
        setIsAdded(false);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isAdded]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      const formData = new FormData();
      formData.append("id", product.id);
      formData.append("quantity", quantity.toString());

      const response = await fetch("/api/cart/add", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setIsAdded(true);
        router.refresh();
      } else {
        console.error("Failed to add item to cart:", result.error);
        alert(result.error || "Failed to add item to cart");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={decreaseQuantity}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100"
            disabled={quantity <= 1 || isAdding || isAdded}
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={handleQuantityChange}
            className="w-16 text-center py-2 border-x border-gray-300 focus:outline-none"
            disabled={isAdding || isAdded}
          />
          <button
            type="button"
            onClick={increaseQuantity}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100"
            disabled={quantity >= product.stock || isAdding || isAdded}
          >
            +
          </button>
        </div>
        <span className="ml-4 text-sm text-gray-500">
          {product.stock} available
        </span>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isAdding || isAdded}
        className={`w-full py-3 px-4 rounded-md flex items-center justify-center transition-colors ${
          isAdded
            ? "bg-green-600 text-white"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        } ${isAdding || isAdded ? "opacity-75" : ""}`}
      >
        {isAdding ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Adding to Cart...
          </>
        ) : isAdded ? (
          <>
            <FaCheck className="mr-2" />
            Added to Cart!
          </>
        ) : (
          <>
            <FaShoppingCart className="mr-2" />
            Add to Cart
          </>
        )}
      </button>
    </div>
  );
}
