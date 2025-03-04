// src/app/api/paypal/create-order/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCart } from "@/app/actions/cartActions";
import prisma from "@/lib/db"; // Make sure this import matches your actual db import

export async function POST() {
  try {
    const session = await auth();

    // Get cart items
    const cartItems = await getCart();

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    // Create a PayPal order
    const paypalUrl =
      process.env.PAYPAL_MODE === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: "PayPal credentials not configured" },
        { status: 500 }
      );
    }

    // Get access token
    const authResponse = await fetch(`${paypalUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${clientId}:${clientSecret}`
        ).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      console.error("PayPal auth error:", authData);
      return NextResponse.json(
        { error: "Failed to authenticate with PayPal" },
        { status: 500 }
      );
    }

    // Create order
    const orderResponse = await fetch(`${paypalUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.access_token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: total.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: total.toFixed(2),
                },
              },
            },
            items: cartItems.map((item: any) => ({
              name: item.name,
              quantity: item.quantity.toString(),
              unit_amount: {
                currency_code: "USD",
                value: Number(item.price).toFixed(2),
              },
            })),
          },
        ],
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error("PayPal order creation error:", orderData);
      return NextResponse.json(
        { error: "Failed to create PayPal order" },
        { status: 500 }
      );
    }

    // Since we're having issues with the PaymentIntent model, let's store the payment info in the Order model directly
    // Create a pending order with the payment info in metadata
    await prisma.order.create({
      data: {
        userId: session?.user?.id,
        total,
        status: "PENDING",
        paymentStatus: "PENDING",
        paymentMethod: "PAYPAL",
        shippingAddress: "To be updated",
        metadata: {
          paypalOrderId: orderData.id,
          paymentStatus: "CREATED",
        },
      },
    });

    return NextResponse.json({ id: orderData.id });
  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
