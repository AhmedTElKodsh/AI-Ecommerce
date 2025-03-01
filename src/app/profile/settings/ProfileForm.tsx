// src/app/profile/settings/ProfileForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { updateProfile } from "@/app/actions/userActions";

type User = {
  id: string;
  name: string | null;
  email: string;
};

export default function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user.name || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);

      const result = await updateProfile(formDataToSend);

      if (result.success) {
        setSuccess("Profile updated successfully");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update profile");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          value={user.email}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
        />
        <p className="mt-1 text-sm text-gray-500">
          Email cannot be changed. Contact support if you need to update your
          email.
        </p>
      </div>

      <div className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
        >
          {isSubmitting ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </button>
      </div>
    </form>
  );
}
