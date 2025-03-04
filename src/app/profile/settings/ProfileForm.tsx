// src/app/profile/settings/ProfileForm.tsx
"use client";

import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { updateProfile } from "@/app/actions/userActions";

type ProfileFormProps = {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const result = await updateProfile(formData);

      if (result.success) {
        setSuccess("Profile updated successfully");
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="userId" value={user.id} />

      <div className="mb-6">
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
          defaultValue={user.name || ""}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="mb-6">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          defaultValue={user.email}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Email address cannot be changed
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4">
          <p className="text-green-700">✓ {success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex justify-center"
      >
        {isLoading ? (
          <>
            <FaSpinner className="animate-spin mr-2" /> Updating...
          </>
        ) : (
          "Update Profile"
        )}
      </button>
    </form>
  );
}
