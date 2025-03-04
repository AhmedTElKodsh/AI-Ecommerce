// src/app/actions/authActions.ts
"use server";

import { authOptions } from "@/auth";
import { signIn } from "next-auth/react"; // Fixed import to use the correct module
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { revalidatePath } from "next/cache"; // Added missing import
import nodemailer from "nodemailer"; // Added for email functionality


// Define a type for AuthError
type AuthError = {
  type: string;
  message: string;
};

// Add email helper function
type EmailParams = {
  to: string;
  subject: string;
  html: string;
};


async function sendEmail({ to, subject, html }: EmailParams) {
  // Create a transporter using environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  // Send the email
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
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
    // Now attempt to sign in
    return await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: redirectUrl,
    });

    // Note: The above line will redirect on success, so the code below only runs on error
  } catch (error) {
    // Handle specific error types with type checking
    if (error instanceof Error) {
      // Check if it's an AuthError by checking for the 'type' property
      if ("type" in error) {
        const authError = error as AuthError;
        switch (authError.type) {
          case "CredentialsSignin":
            return {
              error: "Invalid email or password. Please try again.",
            };
          default:
            return {
              error: `Authentication error: ${authError.type}`,
            };
        }
      }
      return { error: error.message };
    }
    return { error: "An unexpected error occurred" };
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

export async function updateUserProfile(formData: FormData) {
  try {
    const userId = formData.get("userId") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!userId || !name || !email) {
      return { success: false, error: "Missing required fields" };
    }

    // Check if email is already in use by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Email already in use by another account",
      };
    }

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
      },
    });

    revalidatePath("/profile"); // Now properly imported
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(formData: FormData) {
  try {
    const userId = formData.get("userId") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!userId || !currentPassword || !newPassword) {
      return { success: false, error: "Missing required fields" };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user || !user.password) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Password change error:", error);
    return { success: false, error: "Failed to change password" };
  }
}

export async function requestPasswordReset(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      error: "Email is required",
    };
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist
      return {
        success: true,
        message:
          "If your email is registered, you will receive a password reset link",
      };
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Set token expiry to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 360000);

    // Check if a password reset record already exists for this user
    const existingReset = await prisma.passwordReset.findFirst({
      where: { userId: user.id },
    });

    if (existingReset) {
      // Update existing record
      await prisma.passwordReset.update({
        where: { id: existingReset.id },
        data: {
          token: resetToken,
          expires: resetTokenExpiry,
        },
      });
    } else {
      // Create new record
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: resetToken,
          expires: resetTokenExpiry,
        },
      });
    }

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    return {
      success: true,
      message:
        "If your email is registered, you will receive a password reset link",
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      error: "Something went wrong. Please try again later.",
    };
  }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Add validation that was missing
  if (!token || !password || !confirmPassword) {
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
    // Find the password reset record with valid token and expiry - using lowercase model name
    const passwordReset = await prisma.passwordReset.findFirst({
    where: {
    token: token,
    expires: {
    gt: new Date(),
    },
    },
    include: {
    user: true,
    },
    });

    if (!passwordReset) {
    return {
    error: "Invalid or expired reset token",
    };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
    where: { id: passwordReset.userId },
    data: {
    password: hashedPassword,
    },
    });

    // Delete the password reset record - using lowercase model name
    await prisma.passwordReset.delete({
    where: { id: passwordReset.id },
    });

    return {
    success: true,
    message:
    "Password has been reset successfully. You can now log in with your new password.",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
    error: "Something went wrong. Please try again later.",
    };
  }
}