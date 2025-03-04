// src/components/cart/CartClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaShoppingCart, FaArrowLeft, FaTrash } from "react-icons/fa";
import { useCart, CartItem } from "@/components/providers/CartProvider";
import { toast } from "react-hot-toast";

interface CartClientProps {
  initialCartItems: CartItem[];
}

export default function CartClient({ initialCartItems }: CartClientProps) {
  const { items, removeItem, updateQuantity, clearCart, isLoading } = useCart();
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  // Sync with client-side cart state
  useEffect(() => {
    setCartItems(items);
  }, [items]);

  const isEmpty = cartItems.length === 0;

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0; // Free shipping for now
  const total = subtotal + shipping;

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCart();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {isEmpty ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <FaShoppingCart className="mx-auto text-4xl text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            href="/products"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            <FaArrowLeft className="inline mr-2" /> Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200 flex justify-between">
                <h2 className="font-medium">Product Details</h2>
                <button
                  onClick={handleClearCart}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-800 transition-colors text-sm"
                >
                  Clear Cart
                </button>
              </div>

              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-6">
                    <div className="flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="sm:w-24 sm:h-24 flex-shrink-0 mb-4 sm:mb-0">
                        <div className="relative w-full h-24">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 100vw, 96px"
                              className="object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                              No image
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 sm:ml-6">
                        <div className="flex justify-between mb-2">
                          <Link
                            href={`/products/${item.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {item.name}
                          </Link>
                          <p className="text-lg font-medium text-gray-900">
                            ${formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                          ${formatPrice(item.price)} each
                        </p>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <select
                              value={item.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.id,
                                  parseInt(e.target.value)
                                )
                              }
                              disabled={isLoading}
                              className="mr-4 p-2 border border-gray-300 rounded"
                            >
                              {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove item"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="p-6 border-t border-gray-200">
                <Link
                  href="/products"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <FaArrowLeft className="mr-2" /> Continue Shopping
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="text-gray-900">${formatPrice(subtotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Shipping</p>
                  <p className="text-gray-900">
                    {shipping === 0 ? "Free" : `$${formatPrice(shipping)}`}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <p className="text-lg font-medium text-gray-900">Total</p>
                  <p className="text-lg font-medium text-gray-900">
                    ${formatPrice(total)}
                  </p>
                </div>
              </div>

              <Link
                href="/checkout"
                className={`w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Proceed to Checkout
              </Link>

              <div className="mt-6 text-sm text-gray-500">
                <p className="mb-2">We accept:</p>
                <div className="flex space-x-2">
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
