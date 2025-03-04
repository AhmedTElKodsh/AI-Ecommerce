// src/app/api/cart/get/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCart } from "@/app/actions/cartActions";

export async function GET() {
  try {
    const items = await getCart();

    // Normalize cart items to ensure consistent types
    const normalizedItems = Array.isArray(items)
      ? items.map((item) => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
        }))
      : [];

    return NextResponse.json({
      success: true,
      items: normalizedItems,
    });
  } catch (error) {
    console.error("Error in cart/get API route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get cart items" },
      { status: 500 }
    );
  }
}
