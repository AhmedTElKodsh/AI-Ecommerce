// src/components/cart/CheckoutButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { FaLock, FaSpinner } from "react-icons/fa";

export default function CheckoutButton() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    setIsProcessing(true);
    
    try {
      if (status === "authenticated") {
        // User is logged in, proceed to checkout
        router.push("/checkout");
      } else {
        // User is not logged in, redirect to login with return URL
        router.push("/login?callbackUrl=/checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isProcessing}
      className="w-full bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700 flex items-center justify-center disabled:opacity-70"
    >
      {isProcessing ? (
        <>
          <FaSpinner className="animate-spin mr-2" /> Processing...
        </>
      ) : (
        <>
          <FaLock className="mr-2" /> Proceed to Checkout
        </>
      )}
    </button>
  );
}