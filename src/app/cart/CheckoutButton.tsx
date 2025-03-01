// src/components/cart/CheckoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaLock } from "react-icons/fa";

export default function CheckoutButton() {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const handleCheckout = () => {
    if (status === "authenticated") {
      // User is logged in, proceed to checkout
      router.push("/checkout");
    } else {
      // User is not logged in, redirect to login with return URL
      router.push("/login?callbackUrl=/checkout");
    }
  };
  
  return (
    <button
      onClick={handleCheckout}
      className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 flex items-center justify-center"
    >
      <FaLock className="mr-2" />
      Proceed to Checkout
    </button>
  );
}