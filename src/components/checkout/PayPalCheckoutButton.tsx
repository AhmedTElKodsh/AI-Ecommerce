// src / components / checkout / PayPalCheckoutButton.tsx;
"use client"

import { PayPalButtons } from "@paypal/react-paypal-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PayPalCheckoutButtonProps {
  amount: number;
  orderData: {
    email: string;
    shippingAddress: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      image?: string;
    }>;
  };
}

interface PayPalOrderResponse {
  id: string;
  error?: string;
}

export default function PayPalCheckoutButton({
  amount,
  orderData,
}: PayPalCheckoutButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrder = async (): Promise<string | null> => {
    try {
      const response = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          orderData,
        }),
      });

      const data: PayPalOrderResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create PayPal order");
      }

      return data.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderID: data.orderID,
        }),
      });

      const captureData = await response.json();

      if (!response.ok) {
        throw new Error(captureData.error || "Failed to capture PayPal order");
      }

      // Redirect to success page
      router.push(`/checkout/success?order_id=${captureData.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className={isProcessing ? "opacity-50 pointer-events-none" : ""}>
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: "pay",
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err: Error) => {
            // Added type annotation for the error parameter
            setError("PayPal checkout error. Please try again.");
            console.error("PayPal error:", err);
          }}
        />
      </div>

      {isProcessing && (
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Processing your payment, please wait...
          </p>
        </div>
      )}
    </div>
  );
}
