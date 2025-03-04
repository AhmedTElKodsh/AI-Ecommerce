// src/components/providers/PayPalProvider.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

type PayPalContextType = {
  isProcessing: boolean;
  setIsProcessing: (state: boolean) => void;
  paymentSuccess: boolean;
  setPaymentSuccess: (state: boolean) => void;
  paymentError: string | null;
  setPaymentError: (error: string | null) => void;
  resetPaymentState: () => void;
};

const PayPalContext = createContext<PayPalContextType | null>(null);

export function PayPalProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Reset payment state to initial values
  const resetPaymentState = () => {
    setIsProcessing(false);
    setPaymentSuccess(false);
    setPaymentError(null);
  };

  // Initial PayPal script options
  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "USD",
    intent: "capture",
  };

  return (
    <PayPalContext.Provider
      value={{
        isProcessing,
        setIsProcessing,
        paymentSuccess,
        setPaymentSuccess,
        paymentError,
        setPaymentError,
        resetPaymentState,
      }}
    >
      <PayPalScriptProvider options={initialOptions}>
        {children}
      </PayPalScriptProvider>
    </PayPalContext.Provider>
  );
}

export function usePayPal() {
  const context = useContext(PayPalContext);
  if (!context) {
    throw new Error("usePayPal must be used within a PayPalProvider");
  }
  return context;
}
