// src/app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import Stripe from "stripe";
import prisma from "@/lib/db";
import { getCart, clearCart } from "@/app/actions/cartActions";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-02-24.acacia"
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { shippingAddress } = await request.json();

    // Get cart items
    const cart = await getCart();

    if (!cart || cart.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty" },
        { status: 400 }
      );
    }

    // Format line items for Stripe
    const lineItems = cart.map((item: { name: any; images: string | any[]; description: string; price: number; quantity: any; }) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.images && item.images.length > 0 ? [item.images[0]] : [],
          description: item.description?.substring(0, 255),
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      metadata: {
        userId: session?.user?.id || "guest",
        shippingAddress: JSON.stringify(shippingAddress),
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}



