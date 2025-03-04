// src/app/api/paypal/capture-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/db";
import { getCart, clearCart } from "@/app/actions/cartActions";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { orderID } = await request.json();

    if (!orderID) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Capture the PayPal order
    const paypalUrl =
      process.env.PAYPAL_MODE === "sandbox"
        ? "https://api-m.sandbox.paypal.com"
        : "https://api-m.paypal.com";

    // Get access token
    const authResponse = await fetch(`${paypalUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
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

    // Capture the order
    const paypalResponse = await fetch(
      `${paypalUrl}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authData.access_token}`,
        },
      }
    );

    const paypalData = await paypalResponse.json();

    if (!paypalResponse.ok) {
      console.error("PayPal API error:", paypalData);
      return NextResponse.json(
        { error: "Failed to capture PayPal order" },
        { status: 500 }
      );
    }

    // Get cart items
    const cartItems = await getCart();

    // Calculate total
    const total = cartItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Extract shipping address from PayPal data
    const shippingAddress = paypalData.purchase_units[0]?.shipping?.address
      ? `${paypalData.purchase_units[0].shipping.name.full_name}\n${paypalData.purchase_units[0].shipping.address.address_line_1}\n${paypalData.purchase_units[0].shipping.address.admin_area_2}, ${paypalData.purchase_units[0].shipping.address.postal_code}\n${paypalData.purchase_units[0].shipping.address.country_code}`
      : "No shipping address provided";

    // Find the pending order we created earlier
    // Use a type assertion to fix the TypeScript error with JSON querying
    const pendingOrder = await prisma.order.findFirst({
      where: {
        metadata: {
          path: ["paypalOrderId"],
          equals: orderID,
        } as any, // Type assertion to bypass TypeScript error
      },
    });

    let order;

    if (pendingOrder) {
      // Extract metadata as an object to fix the spread operator issue
      let metadataObj: Record<string, any> = {};

      // Safely convert the metadata to an object we can spread
      if (pendingOrder.metadata !== null) {
        if (typeof pendingOrder.metadata === "string") {
          try {
            metadataObj = JSON.parse(pendingOrder.metadata);
          } catch (e) {
            console.error("Failed to parse metadata string:", e);
          }
        } else if (typeof pendingOrder.metadata === "object") {
          metadataObj = pendingOrder.metadata as Record<string, any>;
        }
      }

      // Update the existing order
      order = await prisma.order.update({
        where: { id: pendingOrder.id },
        data: {
          status: "PROCESSING",
          paymentStatus: "PAID",
          shippingAddress: shippingAddress,
          metadata: {
            ...metadataObj, // Now we can safely spread the metadata
            paymentStatus: "COMPLETED",
            captureId: paypalData.purchase_units[0]?.payments?.captures[0]?.id,
          },
          items: {
            create: cartItems.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
              name: item.name,
            })),
          },
        },
      });
    } else {
      // Create a new order if no pending order exists
      order = await prisma.order.create({
        data: {
          userId: session?.user?.id,
          total,
          status: "PROCESSING",
          paymentStatus: "PAID",
          shippingAddress: shippingAddress,
          paymentMethod: "PAYPAL",
          metadata: {
            paypalOrderId: orderID,
            paymentStatus: "COMPLETED",
            captureId: paypalData.purchase_units[0]?.payments?.captures[0]?.id,
          },
          items: {
            create: cartItems.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
              name: item.name,
            })),
          },
        },
      });
    }

    // Update product stock
    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (product && product.stock >= item.quantity) {
        await prisma.product.update({
          where: { id: item.id },
          data: { stock: product.stock - item.quantity },
        });
      }
    }

    // Clear the cart
    await clearCart();

    return NextResponse.json({
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error("PayPal capture order error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
