// app/actions/authActions.ts
"use server";

import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

// Define a type for AuthError
type AuthError = {
  type: string;
  message: string;
};

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
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    return { error: "Something went wrong" };
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
