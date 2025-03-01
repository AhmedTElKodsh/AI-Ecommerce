// src/app/profile/settings/PasswordForm.tsx
"use client";

import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { changePassword } from "@/app/actions/userActions";

export default function PasswordForm({ userId }: { userId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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
      // Validate passwords
      if (formData.newPassword !== formData.confirmPassword) {
        throw new Error("New passwords do not match");
      }

      if (formData.newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("currentPassword", formData.currentPassword);
      formDataToSend.append("newPassword", formData.newPassword);

      const result = await changePassword(formDataToSend);

      if (result.success) {
        setSuccess("Password changed successfully");
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        throw new Error(result.error || "Failed to change password");
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
          htmlFor="currentPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="newPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          Password must be at least 8 characters long.
        </p>
      </div>

      <div className="mb-4">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
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
            "Change Password"
          )}
        </button>
      </div>
    </form>
  );
}
