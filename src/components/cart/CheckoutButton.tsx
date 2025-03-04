// src/components/cart/CheckoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useSession } from "next-auth/react";

export default function CheckoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      if (!session) {
        // Redirect to login if not authenticated
        router.push("/auth/signin?callbackUrl=/checkout");
        return;
      }

      // Redirect to checkout
      router.push("/checkout");
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-70"
    >
      {isLoading ? (
        <>
          <FaSpinner className="animate-spin mr-2" />
          Processing...
        </>
      ) : (
        "Proceed to Checkout"
      )}
    </button>
  );
}
