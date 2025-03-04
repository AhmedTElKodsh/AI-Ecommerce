// src/components/cart/CartItemList.tsx
"use client";

import { useCart } from "@/components/providers/CartProvider";
import Image from "next/image";
import Link from "next/link";
import { FaTrash } from "react-icons/fa";
import ClearCartButton from "./ClearCartButton";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export default function CartItemList({ items }: { items: CartItem[] }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Cart Items ({items.length})</h2>
        <ClearCartButton />
      </div>

      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="py-6 flex flex-wrap md:flex-nowrap">
            {/* Product Image */}
            <div className="w-full md:w-24 h-24 mb-4 md:mb-0 relative">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="96px"
                  className="object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                  No image
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="md:ml-6 flex-grow">
              <Link
                href={`/products/${item.id}`}
                className="text-lg font-medium text-gray-900 hover:text-indigo-600"
              >
                {item.name}
              </Link>

              <div className="mt-1 text-gray-500">
                ${item.price.toFixed(2)} each
              </div>

              <div className="mt-4 flex items-center">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity - 1)
                    }
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-x border-gray-300">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.id, item.quantity + 1)
                    }
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-4 text-red-600 hover:text-red-800"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="w-full md:w-auto mt-4 md:mt-0 text-right">
              <div className="text-lg font-semibold">
                ${(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}