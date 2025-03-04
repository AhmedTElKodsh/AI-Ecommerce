// src/app/admin/users/[id]/edit/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import prisma from "@/lib/db";
import UserEditForm from "./UserEditForm";

export default async function EditUserPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  // Check if user is authenticated and is an admin
  if (!session || session.user.role !== "ADMIN") {
    redirect(`/login?callbackUrl=/admin/users/${params.id}/edit`);
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Users
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">Edit User</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <UserEditForm user={user} />
      </div>
    </div>
  );
}
