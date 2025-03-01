// src/app/cart/page.tsx
import { getCart } from "@/app/actions/cartActions";
import Link from "next/link";
import Image from "next/image";
import { FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import CartItemForm from "@/components/cart/CartItemForm";
import RemoveItemButton from "@/components/cart/RemoveItemButton";
import ClearCartButton from "@/components/cart/ClearCartButton";
import CheckoutButton from "@/components/cart/CheckoutButton";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = {
  title: "Shopping Cart | ShopNext",
  description: "View and manage your shopping cart",
};

// Define the cart item type
type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

export default async function CartPage() {
  // Ensure cart items are properly typed and price is always a number
  const cartData = await getCart();
  const cartItems: CartItem[] = Array.isArray(cartData)
    ? cartData.map((item) => ({
        ...item,
        price: Number(item.price), // Ensure price is a number
        quantity: Number(item.quantity), // Ensure quantity is a number
      }))
    : [];

  const isEmpty = cartItems.length === 0;

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0; // Free shipping for now
  const total = subtotal + shipping;

  // Helper function to format price
  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {isEmpty ? (
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added any products to your cart yet."
          icon={<FaShoppingCart className="h-12 w-12 text-gray-400" />}
          action={
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaArrowLeft className="mr-2" /> Continue Shopping
            </Link>
          }
        />
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="p-6">
                    <div className="flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="sm:w-24 sm:h-24 flex-shrink-0 mb-4 sm:mb-0">
                        <div className="relative w-full h-24">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 100vw, 96px"
                              className="object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                              No image
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 sm:ml-6">
                        <div className="flex justify-between mb-2">
                          <Link
                            href={`/products/${item.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                          >
                            {item.name}
                          </Link>
                          <p className="text-lg font-medium text-gray-900">
                            ${formatPrice(item.price * item.quantity)}
                          </p>
                        </div>

                        <p className="text-sm text-gray-500 mb-4">
                          ${formatPrice(item.price)} each
                        </p>

                        <div className="flex justify-between items-center">
                          <CartItemForm item={item} />
                          <RemoveItemButton id={item.id} />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="p-6 border-t border-gray-200 flex justify-between">
                <Link
                  href="/products"
                  className="text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <FaArrowLeft className="mr-2" /> Continue Shopping
                </Link>
                <ClearCartButton />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <p className="text-gray-600">Subtotal</p>
                  <p className="text-gray-900">${formatPrice(subtotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Shipping</p>
                  <p className="text-gray-900">
                    {shipping === 0 ? "Free" : `$${formatPrice(shipping)}`}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <p className="text-lg font-medium text-gray-900">Total</p>
                  <p className="text-lg font-medium text-gray-900">
                    ${formatPrice(total)}
                  </p>
                </div>
              </div>

              <CheckoutButton />

              <div className="mt-6 text-sm text-gray-500">
                <p className="mb-2">We accept:</p>
                <div className="flex space-x-2">
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
