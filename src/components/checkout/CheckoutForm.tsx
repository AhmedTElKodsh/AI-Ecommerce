// src/components/checkout/CheckoutForm.tsx
"use client";

import { useState, useEffect } from "react"; // Add the missing import
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { toast } from "react-hot-toast";
import { FaSpinner, FaLock } from "react-icons/fa";
import Link from "next/link";

interface CheckoutFormProps {
  isLoggedIn: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Use named export instead of default export
export function CheckoutForm({ isLoggedIn }: CheckoutFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [orderData, setOrderData] = useState<Record<string, any>>({});
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // Fetch cart total for PayPal
  useEffect(() => {
    const fetchCartTotal = async () => {
      try {
        const response = await fetch("/api/cart/total");
        const data = await response.json();
        setTotalPrice(data.total);
      } catch (error) {
        console.error("Error fetching cart total:", error);
      }
    };

    fetchCartTotal();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Save shipping details
      const response = await fetch("/api/checkout/shipping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to save shipping details");
      }

      setOrderData(data);
      setShowPayment(true);

      // Create PayPal order
      const orderResponse = await fetch("/api/paypal/create-order", {
        method: "POST",
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create PayPal order");
      }

      const orderResult = await orderResponse.json();
      setPaypalOrderId(orderResult.id);

      toast.success("Ready for payment");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

      {!isLoggedIn && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Already have an account?{" "}
            <Link
              href="/auth/signin?callbackUrl=/checkout"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Log in
            </Link>{" "}
            for a faster checkout experience.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              {...register("firstName", { required: "First name is required" })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              {...register("lastName", { required: "Last name is required" })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Street Address
          </label>
          <input
            type="text"
            id="address"
            {...register("address", { required: "Address is required" })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <input
              type="text"
              id="city"
              {...register("city", { required: "City is required" })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="state"
              className="block text-sm font-medium text-gray-700"
            >
              State / Province
            </label>
            <input
              type="text"
              id="state"
              {...register("state", { required: "State is required" })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">
                {errors.state.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-gray-700"
            >
              Postal Code
            </label>
            <input
              type="text"
              id="postalCode"
              {...register("postalCode", {
                required: "Postal code is required",
              })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <select
              id="country"
              {...register("country", { required: "Country is required" })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
              {/* Add more countries as needed */}
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">
                {errors.country.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            {...register("phone", { required: "Phone number is required" })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {!showPayment ? (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
          >
            <FaLock className="mr-2" /> Continue to Payment
          </button>
        ) : (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Complete Your Payment</h3>
            {paypalOrderId && (
              <PayPalScriptProvider
                options={{
                  "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                  currency: "USD",
                }}
              >
                <PayPalButtons
                  style={{ layout: "vertical" }}
                  createOrder={() => Promise.resolve(paypalOrderId)}
                  onApprove={async (data: { orderID: string }) => {
                    try {
                      // Capture the PayPal order
                      const response = await fetch(
                        "/api/paypal/capture-order",
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            orderID: data.orderID,
                          }),
                        }
                      );

                      const orderData = await response.json();

                      if (orderData.success) {
                        toast.success("Payment successful!");
                        router.push(
                          `/checkout/success?order_id=${orderData.orderId}`
                        );
                      } else {
                        toast.error("Payment failed. Please try again.");
                      }
                    } catch (error) {
                      console.error("Error capturing PayPal order:", error);
                      toast.error(
                        "Payment processing error. Please try again."
                      );
                    }
                  }}
                  onError={(err: Error) => {
                    console.error("PayPal error:", err);
                    toast.error(
                      "PayPal error. Please try a different payment method."
                    );
                  }}
                />
              </PayPalScriptProvider>
            )}
          </div>
        )}

        <p className="mt-4 text-sm text-gray-500 text-center">
          By placing your order, you agree to our{" "}
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-800">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
