// src/app/actions/userActions.ts
"use server";

import prisma from "@/lib/db";
import { auth } from "@/auth";
import { signIn } from "next-auth/react"; // Fixed import to use the correct module
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { compare, hash } from "bcrypt";
import { getServerSession } from "next-auth";

// Define a type for AuthError
type AuthError = {
  type: string;
  message: string;
};

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;

    // Verify the user is updating their own profile
    if (session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Update the user profile
    await prisma.user.update({
      where: { id: userId },
      data: { name },
    });

    revalidatePath("/profile");
    revalidatePath("/profile/settings");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate input
  if (!name || !email || !password) {
    return {
      error: "All fields are required",
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match",
    };
  }

  // Validate password complexity
  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters long",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      error: "Password must contain at least one special character",
    };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        error: "User with this email already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // First user is admin, others are regular users
        role: (await prisma.user.count()) === 0 ? "ADMIN" : "USER",
      },
    });

    return {
      success: true,
      message: "Registration successful! Please sign in.",
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      error: "Something went wrong during registration",
    };
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectUrl = (formData.get("redirectUrl") as string) || "/";

  if (!email || !password) {
    return {
      error: "Email and password are required",
    };
  }

  try {
    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        error: "No account found with this email. Please register first.",
      };
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectUrl,
    });

    // Note: This code won't be reached if signIn succeeds because it redirects
    return { success: true };
  } catch (error) {
    // Check if error is an object with a type property
    if (error && typeof error === "object" && "type" in error) {
      const authError = error as AuthError;
      switch (authError.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: `Authentication error: ${authError.type}` };
      }
    }
    return { error: "Something went wrong" };
  }
}

export async function changePassword(formData: FormData) {
  // Updated to use the new Auth.js approach
  const session = await auth();

  if (!session?.user?.email) {
    return {
      success: false,
      error: "You must be logged in",
    };
  }

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    return {
      success: false,
      error: "All fields are required",
    };
  }

  try {
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { password: true },
    });

    if (!user?.password) {
      return {
        success: false,
        error: "No password set for this account",
      };
    }

    // Verify current password with bcryptjs for consistency
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return {
        success: false,
        error: "Current password is incorrect",
      };
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      error: "Failed to update password",
    };
  }
}

export async function updatePassword(formData: FormData) {
  try {
    const session = await auth();

    if (!session) {
      return { success: false, error: "Not authenticated" };
    }

    const userId = formData.get("userId") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    // Verify the user is updating their own password
    if (session.user.id !== userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Get the user with their current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user || !user.password) {
      return { success: false, error: "User not found" };
    }

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating password:", error);
    return { success: false, error: "Failed to update password" };
  }
}

