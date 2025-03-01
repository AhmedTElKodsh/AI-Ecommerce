// src/app/cart/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { FaShoppingCart, FaArrowLeft } from "react-icons/fa";
import CartItemList from "@/components/cart/CartItemList";
import CartSummary from "@/components/cart/CartSummary";
import EmptyCart from "@/components/cart/EmptyCart";

export const metadata = {
  title: "Shopping Cart | ShopNext",
  description: "View and manage your shopping cart",
};

export default async function CartPage() {
  // Get cart from cookies
  const cartCookie = (await cookies()).get("cart");
  let cartItems = [];
  
  if (cartCookie?.value) {
    try {
      cartItems = JSON.parse(cartCookie.value);
    } catch (error) {
      console.error("Failed to parse cart cookie:", error);
    }
  }
  
  const isEmpty = !cartItems || cartItems.length === 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <FaShoppingCart className="mr-3" /> Shopping Cart
      </h1>
      
      {isEmpty ? (
        <EmptyCart />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItemList items={cartItems} />
            
            <div className="mt-6">
              <Link
                href="/products"
                className="text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <FaArrowLeft className="mr-2" /> Continue Shopping
              </Link>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <CartSummary items={cartItems} />
          </div>
        </div>
      )}
    </div>
  );
}