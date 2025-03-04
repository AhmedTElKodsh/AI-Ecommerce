// src/app/api/cart/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { updateCartItemQuantity } from "@/app/actions/cartActions";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await updateCartItemQuantity(formData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in cart/update API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update item quantity" },
      { status: 500 }
    );
  }
}
