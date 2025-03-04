// src/app/checkout/success/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const session = await auth();
  const orderId = searchParams.order_id;

  if (!orderId) {
    redirect("/");
  }

  try {
    // Retrieve the order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            // Include the product to get the name if not stored in OrderItem
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    // Check if user is authorized to view this order
    if (
      (order.userId && !session) ||
      (session?.user?.id !== order.userId && session?.user?.role !== "ADMIN")
    ) {
      redirect(
        "/auth/signin?callbackUrl=" +
          encodeURIComponent(`/checkout/success?order_id=${orderId}`)
      );
    }

    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been received and is now
            being processed.
          </p>

          <div className="mb-8 text-left border-t border-b py-4 mt-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Order ID:</span> {order.id}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Date:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Payment Status:</span>{" "}
              <span
                className={`font-medium ${
                  order.paymentStatus === "PAID"
                    ? "text-green-600"
                    : "text-orange-500"
                }`}
              >
                {order.paymentStatus}
              </span>
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-medium">Payment Method:</span>{" "}
              {order.paymentMethod}
            </p>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-3 text-left">Items</h3>
            <div className="divide-y">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="py-3 flex justify-between text-left"
                >
                  <div>
                    {/* Use the product name from the relation, or fall back to other properties */}
                    <p className="font-medium">
                      {item.product?.name ||
                        // @ts-ignore - Handle potential name property if it exists
                        item.name ||
                        `Product #${item.productId.substring(0, 8)}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-bold">Total</span>
              <span className="font-bold">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="mb-8 text-left">
              <h3 className="font-semibold text-lg mb-2">Shipping Address</h3>
              <p className="text-gray-700 whitespace-pre-line">
                {order.shippingAddress}
              </p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            <Link
              href="/orders"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              View My Orders
            </Link>
            <Link
              href="/"
              className="bg-gray-100 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-200 transition flex items-center justify-center gap-2"
            >
              <FaArrowLeft className="text-sm" /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error retrieving order:", error);
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">
            We couldn't retrieve your order information.
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }
}
