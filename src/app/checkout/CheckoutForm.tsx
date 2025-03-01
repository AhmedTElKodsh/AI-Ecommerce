// src/components/checkout/CheckoutForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner, FaLock } from "react-icons/fa";
import { createOrder } from "@/app/actions/orderActions";
import Link from "next/link";

export type CheckoutFormProps = {
  isLoggedIn: boolean;
};

export default function CheckoutForm({ isLoggedIn }: CheckoutFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    paymentMethod: "credit_card",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      const requiredFields = [
        "fullName",
        "email",
        "address",
        "city",
        "postalCode",
        "country",
      ];

      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          throw new Error(
            `${field.replace(/([A-Z])/g, " $1").toLowerCase()} is required`
          );
        }
      }

      // Validate payment details
      if (formData.paymentMethod === "credit_card") {
        if (!formData.cardNumber || !formData.cardExpiry || !formData.cardCvc) {
          throw new Error("Please complete all payment details");
        }

        // Simple validation for card number (16 digits)
        if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))) {
          throw new Error("Invalid card number");
        }

        // Simple validation for expiry (MM/YY)
        if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
          throw new Error("Invalid expiry date (use MM/YY format)");
        }

        // Simple validation for CVC (3-4 digits)
        if (!/^\d{3,4}$/.test(formData.cardCvc)) {
          throw new Error("Invalid CVC");
        }
      }

      // Create shipping address string
      const shippingAddress = `${formData.fullName}\n${formData.address}\n${formData.city}, ${formData.postalCode}\n${formData.country}`;

      // Submit order
      const result = await createOrder({
        email: formData.email,
        shippingAddress,
        paymentMethod: formData.paymentMethod,
      });

      if (result.success) {
        // Redirect to order confirmation page
        router.push(`/checkout/confirmation/${result.orderId}`);
      } else {
        throw new Error(result.error || "Failed to create order");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setIsSubmitting(false);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Shipping Information</h2>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Contact Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Postal Code *
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Country *
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a country</option>
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="France">France</option>
                <option value="Japan">Japan</option>
                <option value="China">China</option>
                <option value="India">India</option>
                <option value="Brazil">Brazil</option>
                {/* Add more countries as needed */}
              </select>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Payment Method</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Payment Method
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={formData.paymentMethod === "credit_card"}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">Credit Card</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === "paypal"}
                    onChange={handleChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2">PayPal</span>
                </label>
              </div>
            </div>

            {formData.paymentMethod === "credit_card" && (
              <div className="border border-gray-200 rounded-md p-4">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Card Number *
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      required={formData.paymentMethod === "credit_card"}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="cardExpiry"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        id="cardExpiry"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleChange}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required={formData.paymentMethod === "credit_card"}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cardCvc"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        CVC *
                      </label>
                      <input
                        type="text"
                        id="cardCvc"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleChange}
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        required={formData.paymentMethod === "credit_card"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {formData.paymentMethod === "paypal" && (
              <div className="border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-600">
                  You will be redirected to PayPal to complete your payment
                  after placing the order.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Processing...
            </>
          ) : (
            <>
              <FaLock className="mr-2" /> Place Order
            </>
          )}
        </button>

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
