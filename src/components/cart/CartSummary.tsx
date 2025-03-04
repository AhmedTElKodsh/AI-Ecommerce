// src/components/cart/CartSummary.tsx
"use client";

import { useCart } from "@/components/providers/CartProvider";
import CheckoutButton from "./CheckoutButton";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export default function CartSummary({ items }: { items: CartItem[] }) {
  useCart();
  
  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  // Calculate shipping (free over $100, otherwise $10)
  const shipping = subtotal > 100 ? 0 : 10;
  
  // Calculate tax (assume 8%)
  const tax = subtotal * 0.08;
  
  // Calculate total
  const total = subtotal + shipping + tax;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (8%)</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            Including VAT
          </p>
        </div>
      </div>
      
      <div className="mt-6">
        <CheckoutButton />
      </div>
    </div>
  );
}