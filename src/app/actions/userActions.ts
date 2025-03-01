// src/app/actions/userActions.ts
"use server";

import { auth } from "@/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { hash, compare } from "bcrypt";

// Update user profile
export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    // Revalidate paths
    revalidatePath("/profile");
    revalidatePath("/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// Change password
export async function changePassword(formData: FormData) {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!currentPassword || !newPassword) {
      return { success: false, error: "All fields are required" };
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return { success: false, error: "User not found or no password set" };
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to change password:", error);
    return { success: false, error: "Failed to change password" };
  }
}

// Get user by ID (admin only)
export async function getUserById(id: string) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return { success: false, error: "Failed to fetch user" };
  }
}

// Get all users (admin only)
export async function getUsers({
  page = 1,
  limit = 10,
  search,
}: {
  page?: number;
  limit?: number;
  search?: string;
} = {}) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Search by name or email
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where });

    return {
      success: true,
      users,
      pagination: {
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        current: page,
      },
    };
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}
