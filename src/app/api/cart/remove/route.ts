// src/app/api/cart/remove/route.ts
import { NextRequest, NextResponse } from "next/server";
import { removeFromCart } from "@/app/actions/cartActions";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await removeFromCart(formData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in cart/remove API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
