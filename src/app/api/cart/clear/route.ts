// src/app/api/cart/clear/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clearCart } from "@/app/actions/cartActions";

export async function POST() {
  try {
    const result = await clearCart();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in cart/clear API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
