// src/components/checkout/OrderSummary.tsx
import Image from "next/image";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  tax,
  total,
}: OrderSummaryProps) {
  // Helper function to format price
  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      {/* Cart Items Summary */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-start">
            <div className="h-16 w-16 relative flex-shrink-0">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover rounded"
                />
              ) : (
                <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                  No image
                </div>
              )}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-500">
                {item.quantity} x ${formatPrice(item.price)}
              </p>
            </div>
            <div className="text-sm font-medium text-gray-900">
              ${formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-4 space-y-4">
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Subtotal</p>
          <p className="text-sm font-medium text-gray-900">
            ${formatPrice(subtotal)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Shipping</p>
          <p className="text-sm font-medium text-gray-900">
            {shipping === 0 ? "Free" : `$${formatPrice(shipping)}`}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm text-gray-600">Tax</p>
          <p className="text-sm font-medium text-gray-900">
            ${formatPrice(tax)}
          </p>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-4">
          <p className="text-base font-medium text-gray-900">Total</p>
          <p className="text-base font-medium text-gray-900">
            ${formatPrice(total)}
          </p>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="mt-6">
        <p className="text-sm text-gray-600 mb-2">We accept:</p>
        <div className="flex space-x-2">
          <div className="h-8 w-12 bg-blue-100 rounded flex items-center justify-center text-blue-800 text-xs font-medium">
            PayPal
          </div>
          <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-800 text-xs font-medium">
            Visa
          </div>
          <div className="h-8 w-12 bg-gray-100 rounded flex items-center justify-center text-gray-800 text-xs font-medium">
            MC
          </div>
        </div>
      </div>
    </div>
  );
}
