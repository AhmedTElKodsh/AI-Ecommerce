// src/app/profile/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "@/components/profile/ProfileForm"; 
import PasswordForm from "@/components/profile/PasswordForm";
import prisma from "@/lib/db";

export const metadata = {
  title: "My Profile | ShopNext",
  description: "Manage your account settings",
};

export default async function ProfilePage() {
  const session = await auth();

  // Check if user is authenticated
  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Account Navigation</h2>
            <nav className="space-y-2">
              <Link
                href="/profile"
                className="block px-4 py-2 rounded-md bg-indigo-50 text-indigo-700 font-medium"
              >
                Profile Settings
              </Link>
              <Link
                href="/orders"
                className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Order History
              </Link>
              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Account Type</p>
                <p className="font-medium">{user.role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
            <ProfileForm
              user={{
                id: user.id,
                name: user.name || "", // Convert null to empty string
                email: user.email,
              }}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Change Password</h2>
            <PasswordForm userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
