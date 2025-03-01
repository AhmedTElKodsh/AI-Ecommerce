// src/app/checkout/confirmation/[id]/page.tsx
import { getOrderById } from "@/app/actions/orderActions";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { FaCheckCircle, FaHome, FaList } from "react-icons/fa";

export const metadata = {
  title: "Order Confirmation | ShopNext",
  description: "Your order has been placed successfully",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  const { order, success, error } = await getOrderById(params.id);

  // Check if order exists
  if (!success || !order) {
    notFound();
  }

  // Check if user is authorized to view this order
  const isAdmin = session?.user?.role === "ADMIN";
  const isOwner = session?.user?.id === order.userId;

  if (!isAdmin && !isOwner) {
    redirect("/login?callbackUrl=/checkout/confirmation/" + params.id);
  }

  // Format date
  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-xl text-gray-600 mb-6">
            Thank you for your purchase. Your order has been received.
          </p>
          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <p className="text-gray-600 mb-2">Order Number:</p>
            <p className="text-xl font-semibold">{order.id}</p>
          </div>
          <p className="text-gray-600 mb-2">
            A confirmation email has been sent to{" "}
            <span className="font-medium">
              {order.user ? order.user.email : "your email address"}
            </span>
          </p>
        </div>

        {/* Rest of the component remains unchanged */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-gray-600">Order Date:</p>
              <p className="font-medium">{orderDate}</p>
            </div>
            <div>
              <p className="text-gray-600">Order Status:</p>
              <p
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  order.status === "COMPLETED"
                    ? "bg-green-100 text-green-800"
                    : order.status === "PROCESSING"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "SHIPPED"
                    ? "bg-purple-100 text-purple-800"
                    : order.status === "CANCELLED"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {order.status}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Payment Method:</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-600">Payment Status:</p>
              <p
                className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                  order.paymentStatus === "PAID"
                    ? "bg-green-100 text-green-800"
                    : order.paymentStatus === "PENDING"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {order.paymentStatus}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            <p className="whitespace-pre-line">{order.shippingAddress}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            href="/"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 flex items-center justify-center"
          >
            <FaHome className="mr-2" /> Return to Home
          </Link>
          <Link
            href="/orders"
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 flex items-center justify-center"
          >
            <FaList className="mr-2" /> View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
