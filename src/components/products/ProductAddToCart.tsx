// src/components/products/ProductAddToCart.tsx
"use client";

import { useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { FaShoppingCart, FaSpinner } from "react-icons/fa";

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  stock: number;
};

export default function ProductAddToCart({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();

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

  const handleAddToCart = () => {
    setIsAdding(true);

    // Add item to cart
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image:
        product.images && product.images.length > 0 ? product.images[0] : "",
      quantity,
    });

    // Show success message or redirect
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={decreaseQuantity}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100"
            disabled={quantity <= 1}
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
          />
          <button
            type="button"
            onClick={increaseQuantity}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100"
            disabled={quantity >= product.stock}
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
        disabled={isAdding}
        className={`w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center ${
          isAdding ? "opacity-75" : ""
        }`}
      >
        {isAdding ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            Adding to Cart...
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
