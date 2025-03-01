// src/app/profile/settings/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { FaUser, FaShoppingBag, FaHeart, FaCog } from "react-icons/fa";
import prisma from "@/lib/db";
import ProfileForm from "./ProfileForm";
import PasswordForm from "./PasswordForm";

export const metadata = {
  title: "Account Settings | ShopNext",
  description: "Manage your account settings",
};

export default async function AccountSettingsPage() {
  const session = await auth();

  // Check if user is authenticated
  if (!session) {
    redirect("/login?callbackUrl=/profile/settings");
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <FaUser size={24} />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">{user.name || "User"}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                href="/profile"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <FaUser className="mr-3" /> Account Overview
              </Link>
              <Link
                href="/orders"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <FaShoppingBag className="mr-3" /> My Orders
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <FaHeart className="mr-3" /> Wishlist
              </Link>
              <Link
                href="/profile/settings"
                className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md"
              >
                <FaCog className="mr-3" /> Account Settings
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            <ProfileForm user={user} />
          </div>

          {/* Password Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Change Password</h2>
            <PasswordForm userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
