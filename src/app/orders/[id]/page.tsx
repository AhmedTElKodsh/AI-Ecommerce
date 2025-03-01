// src/app/orders/[id]/page.tsx
import { getOrderById } from "@/app/actions/orderActions";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { FaArrowLeft } from "react-icons/fa";

export const metadata = {
  title: "Order Details | ShopNext",
  description: "View your order details",
};

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session) {
    redirect(`/login?callbackUrl=/orders/${params.id}`);
  }
  
  const { order, success, error } = await getOrderById(params.id);
  
  if (!success || !order) {
    redirect("/orders");
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/orders"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Orders
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order Details</h1>
        <span className="text-gray-600">
          Order #{order.id.slice(-6).toUpperCase()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Order Status</p>
              <p className={`font-medium ${
                order.status === "COMPLETED"
                  ? "text-green-600"
                  : order.status === "PROCESSING"
                  ? "text-blue-600"
                  : order.status === "SHIPPED"
                  ? "text-purple-600"
                  : order.status === "CANCELLED"
                  ? "text-red-600"
                  : "text-yellow-600"
              }`}>
                {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium capitalize">
                {order.paymentMethod.replace("_", " ").toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p className={`font-medium ${
                order.paymentStatus === "PAID"
                  ? "text-green-600"
                  : order.paymentStatus === "PENDING"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}>
                {order.paymentStatus.charAt(0) + order.paymentStatus.slice(1).toLowerCase()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <p className="whitespace-pre-line">{order.shippingAddress}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 font-semibold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-lg font-semibold p-6 border-b border-gray-200">
          Order Items
        </h2>
        <div className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <div key={item.id} className="p-6 flex items-start">
              <div className="relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                {item.product.images && item.product.images.length > 0 ? (
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                    No image
                  </div>
                )}
              </div>
              <div className="ml-6 flex-1">
                <Link
                  href={`/products/${item.product.id}`}
                  className="text-lg font-medium text-gray-900 hover:text-indigo-600"
                >
                  {item.product.name}
                </Link>
                <p className="text-gray-500 mt-1">Quantity: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}