// src/app/api/cart/total/route.ts
import { NextResponse } from "next/server";
import { getCart } from "@/app/actions/cartActions";

export async function GET() {
  try {
    const cartItems = await getCart();

    // Calculate total
    const subtotal = cartItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    const shipping = 0; // Free shipping
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    return NextResponse.json({
      subtotal,
      shipping,
      tax,
      total,
    });
  } catch (error) {
    console.error("Error calculating cart total:", error);
    return NextResponse.json(
      { error: "Failed to calculate cart total" },
      { status: 500 }
    );
  }
}
