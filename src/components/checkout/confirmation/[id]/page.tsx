// src/app/checkout/page.tsx
import { getCart } from "@/app/actions/cartActions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
// Changed to named import for CheckoutForm (assuming it's a named export)
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
// Changed to default import for OrderSummary
import OrderSummary from "@/components/checkout/OrderSummary";
import { auth } from "@/auth";

export const metadata = {
  title: "Checkout | ShopNext",
  description: "Complete your purchase",
};

// Define the cart item type
type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

export default async function CheckoutPage() {
  const cartItems = (await getCart()) as CartItem[];
  const session = await auth();

  // Redirect to cart if cart is empty
  if (cartItems.length === 0) {
    redirect("/cart");
  }

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0; // Free shipping for now
  const tax = subtotal * 0.08; // Calculate tax (8% of subtotal)
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/cart"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Cart
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-8">
          <CheckoutForm isLoggedIn={!!session} />
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <OrderSummary
            items={cartItems}
            subtotal={subtotal}
            shipping={shipping}
            tax={tax} // Added the missing tax prop
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
