// app/actions/orderActions.ts
"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cookies } from "next/headers";

// Get cart from cookies
export async function getCart() {
  const cookieStore = await cookies();
  const cartCookie = cookieStore.get("cart");

  if (!cartCookie || !cartCookie.value) {
    return [];
  }

  try {
    return JSON.parse(cartCookie.value);
  } catch (error) {
    console.error("Failed to parse cart cookie:", error);
    return [];
  }
}

// Clear cart
export async function clearCart() {
  (await cookies()).set("cart", "[]", {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  revalidatePath("/cart");
  return { success: true };
}

// Get orders with pagination
export async function getOrders({
  page = 1,
  limit = 10,
  userId,
  status,
}: {
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
} = {}) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin for all orders
    if (!userId && (!session || session.user.role !== "ADMIN")) {
      return { success: false, error: "Unauthorized" };
    }

    // If userId is provided, check if it matches the current user or if user is admin
    if (
      userId &&
      session?.user.id !== userId &&
      session?.user.role !== "ADMIN"
    ) {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.order.count({ where });

    return {
      success: true,
      orders,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
      },
    };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { success: false, error: "Failed to fetch orders" };
  }
}

// Get order by ID
export async function getOrderById(id: string) {
  try {
    const session = await auth();

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Check if user is authorized to view this order
    if (
      !session ||
      (session.user.id !== order.userId && session.user.role !== "ADMIN")
    ) {
      return { success: false, error: "Unauthorized" };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

// Create a new order
export async function createOrder({
  email,
  shippingAddress,
  paymentMethod,
}: {
  email: string;
  shippingAddress: string;
  paymentMethod: string;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const cartItems = await getCart();

    if (cartItems.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    // Calculate total
    const total = cartItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // Start a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          total,
          status: "PENDING",
          paymentStatus: "PENDING",
          shippingAddress,
          paymentMethod,
          ...(userId ? { userId } : {}),
          ...(userId ? {} : { email }),
        },
      });

      // Create order items
      for (const item of cartItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          },
        });

        // Update product stock
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new Error(`Product with ID ${item.id} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }

        await tx.product.update({
          where: { id: item.id },
          data: { stock: product.stock - item.quantity },
        });
      }

      return order;
    });

    // Clear the cart
    await clearCart();

    // Revalidate relevant paths
    revalidatePath("/cart");
    revalidatePath("/checkout");
    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Failed to create order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

// Update order status (admin only)
export async function updateOrderStatus(formData: FormData) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    if (!id || !status) {
      return { success: false, error: "Order ID and status are required" };
    }

    // Update order status
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // Revalidate relevant paths
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${id}`);
    revalidatePath("/orders");

    return { success: true, order };
  } catch (error) {
    console.error("Failed to update order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

// Update payment status (admin only)
export async function updatePaymentStatus(formData: FormData) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const id = formData.get("id") as string;
    const paymentStatus = formData.get("paymentStatus") as string;

    if (!id || !paymentStatus) {
      return {
        success: false,
        error: "Order ID and payment status are required",
      };
    }

    // Update payment status
    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
    });

    // Revalidate relevant paths
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${id}`);
    revalidatePath("/orders");

    return { success: true, order };
  } catch (error) {
    console.error("Failed to update payment status:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}

// Cancel order
export async function cancelOrder(formData: FormData) {
  try {
    const session = await auth();
    const id = formData.get("id") as string;

    if (!id) {
      return { success: false, error: "Order ID is required" };
    }

    // Get the order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Check if user is authorized to cancel this order
    if (
      !session ||
      (session.user.id !== order.userId && session.user.role !== "ADMIN")
    ) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if order can be cancelled (only pending orders)
    if (order.status !== "PENDING") {
      return {
        success: false,
        error: "Only pending orders can be cancelled",
      };
    }

    // Start a transaction
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          paymentStatus:
            order.paymentStatus === "PAID" ? "REFUNDED" : "CANCELLED",
        },
      });

      // Restore product stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }
    });

    // Revalidate relevant paths
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${id}`);
    revalidatePath("/orders");

    return { success: true };
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return { success: false, error: "Failed to cancel order" };
  }
}
