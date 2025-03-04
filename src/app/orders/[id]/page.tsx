// src/app/orders/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getOrders } from "@/app/actions/orderActions";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

// Add these exports to prevent static prerendering
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Your Orders | ShopNext",
  description: "View your order history",
};

export default async function OrdersPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session || !session.user) {
    redirect("/login?callbackUrl=/orders");
  }

  try {
    // Use getOrders with the current user's ID and provide a default empty array for orders
    const {
      orders = [],
      success,
      error,
    } = await getOrders({
      userId: session.user.id,
    });

    if (!success) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error loading orders: {error || "Please try again."}
          </div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 mb-4">
              You haven't placed any orders yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <p className="font-medium">
                        Order #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      <p className="font-medium">${order.total.toFixed(2)}</p>
                      <p
                        className={`text-sm mt-1 ${
                          order.status === "COMPLETED"
                            ? "text-green-600"
                            : order.status === "PROCESSING"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        {order.status.charAt(0) +
                          order.status.slice(1).toLowerCase()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error in orders page:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          An unexpected error occurred. Please try again later.
        </div>
      </div>
    );
  }
}
