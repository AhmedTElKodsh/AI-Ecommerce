// src/app/checkout/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCart } from "@/app/actions/cartActions";
import { CheckoutForm } from "@/components/checkout/CheckoutForm"; // Use named import
import OrderSummary from "@/components/checkout/OrderSummary";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export const metadata = {
  title: "Checkout | NextShop",
  description: "Complete your purchase",
};

export default async function CheckoutPage() {
  const session = await auth();
  const cartData = await getCart();

  // Ensure cart items are properly typed
  const cartItems = Array.isArray(cartData)
    ? cartData.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image,
      }))
    : [];

  // Redirect to cart if cart is empty
  if (!cartItems || cartItems.length === 0) {
    redirect("/cart");
  }

  // Calculate cart totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 0; // Free shipping for now
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link
          href="/cart"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Cart
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CheckoutForm isLoggedIn={!!session} />
        </div>

        <div>
          <OrderSummary
            items={cartItems} 
            subtotal={subtotal}
            shipping={shipping}
            tax={tax}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}