// src/app/login/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authConfig } from "@/auth";
import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login | ShopNext",
  description: "Sign in to your ShopNext account",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const session = await getServerSession(authConfig);
  
  // If user is already logged in, redirect to home or callback URL
  if (session) {
    redirect(searchParams.callbackUrl || "/");
  }
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-6 text-black-override">Sign In</h1>
        <LoginForm callbackUrl={searchParams.callbackUrl} />

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              href={`/register${
                searchParams.callbackUrl
                  ? `?callbackUrl=${searchParams.callbackUrl}`
                  : ""
              }`}
              className="text-indigo-600 hover:text-indigo-800"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}