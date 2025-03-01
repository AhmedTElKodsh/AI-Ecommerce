// src/components/cart/EmptyCart.tsx
import Link from "next/link";
import { FaShoppingBag } from "react-icons/fa";

export default function EmptyCart() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <FaShoppingBag className="text-indigo-600 text-xl" />
      </div>
      
      <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
      
      <p className="text-gray-600 mb-6">
        Looks like you haven't added any products to your cart yet.
      </p>
      
      <Link
        href="/products"
        className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700"
      >
        Start Shopping
      </Link>
    </div>
  );
}