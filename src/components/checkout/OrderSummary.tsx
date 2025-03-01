// src/components/checkout/OrderSummary.tsx
import Image from "next/image";
import Link from "next/link";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type OrderSummaryProps = {
  cartItems: CartItem[];
};

export default function OrderSummary({ cartItems }: OrderSummaryProps) {
  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      <div className="divide-y divide-gray-200">
        {/* Items */}
        <div className="pb-4">
          <ul className="space-y-3">
            {cartItems.map((item) => (
              <li key={item.id} className="flex items-start">
                <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    <Link href={`/products/${item.id}`} className="hover:text-indigo-600">
                      {item.name}
                    </Link>
                  </h4>
                  <p className="text-sm text-gray-500">
                    Qty: {item.quantity}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Totals */}
        <div className="py-4 space-y-2">
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Subtotal</p>
            <p className="text-gray-900">${subtotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Shipping</p>
            <p className="text-gray-900">
              {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
            </p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Tax (8%)</p>
            <p className="text-gray-900">${tax.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Total */}
        <div className="pt-4">
          <div className="flex justify-between">
            <p className="text-base font-medium text-gray-900">Total</p>
            <p className="text-base font-medium text-gray-900">
              ${total.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}