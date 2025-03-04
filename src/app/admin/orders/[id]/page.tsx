// app/admin/orders/[id]/page.tsx
import { getOrderById } from "@/app/actions/orderActions";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";
import UpdateOrderStatusForm from "./UpdateOrderStatusForm";
import UpdatePaymentStatusForm from "./UpdatePaymentStatusForm";

// Define proper types for the order object
type OrderItem = {
  id: string;
  productId: string;
  orderId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
};

type OrderType = {
  id: string;
  createdAt: string | Date;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: string;
  total: number;
  email?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  items: OrderItem[];
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect(`/login?callbackUrl=/admin/orders/${params.id}`);
  }

  const { order: orderData, success, error } = await getOrderById(params.id);

  if (!success || !orderData) {
    notFound();
  }

  // Cast the order to our defined type
  const order = orderData as unknown as OrderType;

  // Format date
  const formattedDate = new Date(order.createdAt).toLocaleString();

  // Calculate order totals - added explicit type annotations to fix TypeScript error
  const subtotal: number = order.items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );
  const shipping: number = 0; // Free shipping for now
  const total: number = subtotal + shipping;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Orders
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Order #{order.id.slice(-6)}</h1>
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="w-16 h-16 relative flex-shrink-0">
                      {item.product.images && item.product.images.length > 0 ? (
                        <Image
                          src={
                            item.product.images[0] ?? "/images/placeholder.jpg"
                          }
                          alt={item.product.name}
                          fill
                          sizes="64px"
                          className="object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <Link
                        href={`/admin/products/${item.product.id}`}
                        className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        Quantity: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-medium">
                        $
                        {(Number(item.price) * Number(item.quantity)).toFixed(
                          2
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        ${Number(item.price).toFixed(2)} each
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details and Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Customer</h2>
            {order.user ? (
              <div>
                <p className="font-medium">{order.user.name}</p>
                <p className="text-gray-600">{order.user.email}</p>
                <Link
                  href={`/admin/users/${order.user.id}`}
                  className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block"
                >
                  View Customer
                </Link>
              </div>
            ) : (
              <div>
                <p className="font-medium">Guest Order</p>
                <p className="text-gray-600">
                  {order.email || "No email provided"}
                </p>
              </div>
            )}
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <p className="whitespace-pre-line">{order.shippingAddress}</p>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <div className="mb-4">
              <p className="text-gray-600">Method:</p>
              <p className="font-medium">
                {order.paymentMethod || "Not specified"}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-gray-600">Status:</p>
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
            <UpdatePaymentStatusForm
              id={order.id}
              currentStatus={order.paymentStatus}
            />
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Status</h2>
            <div className="mb-4">
              <p className="text-gray-600">Current Status:</p>
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
            <UpdateOrderStatusForm id={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
}
