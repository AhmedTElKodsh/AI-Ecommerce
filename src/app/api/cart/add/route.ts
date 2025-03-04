// src/app/api/cart/add/route.ts
import { NextRequest, NextResponse } from "next/server";
import { addToCart } from "@/app/actions/cartActions";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const result = await addToCart(formData);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in cart/add API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}
