// src / app / orders / page.tsx;
import { getServerAuthSession } from "../../auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import { Order, OrderItem, Product } from "@prisma/client";

// Define proper TypeScript interfaces for our data
type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Pick<Product, "id" | "name" | "images">;
  })[];
};

// Type for serialized order data
interface SerializedOrder {
  id: string;
  status: string;
  total: string;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: string;
    product: {
      id: string;
      name: string;
      images: string[] | null; // Changed from string | null to string[] | null
    };
  }[];
}

export default async function OrdersPage() {
  // Get the user session
  const session = await getServerAuthSession();

  // If no session, redirect to login
  if (!session || !session.user) {
    redirect("/login");
  }

  try {
    // Fetch orders from database with proper Prisma query
    const orders = (await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          // Relation is named 'items' in your schema
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })) as unknown as OrderWithItems[]; // Cast to our interface to handle the type

    // Transform data to ensure it's serializable
    const serializedOrders: SerializedOrder[] = orders.map((order) => ({
      id: order.id,
      status: order.status,
      total: order.total.toString(), // Convert Decimal to string
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price.toString(), // Convert Decimal to string
        product: {
          id: item.product.id,
          name: item.product.name,
          images: item.product.images, // This is now correctly typed as string[]
        },
      })),
    }));

    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

        {serializedOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              You haven't placed any orders yet.
            </p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {serializedOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-6 shadow-sm">
                <div className="flex flex-wrap justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Order #{order.id.substring(0, 8)}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="divide-y">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 flex items-center">
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded">
                        {item.product.images &&
                          item.product.images.length > 0 && (
                            <img
                              src={item.product.images[0]} // Use the first image in the array
                              alt={item.product.name}
                              className="h-full w-full object-cover rounded"
                            />
                          )}
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} × ${item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.total}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">
            Error loading orders. Please try again later.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }
}
