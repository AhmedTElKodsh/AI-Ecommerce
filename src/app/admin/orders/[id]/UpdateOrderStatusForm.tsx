// app/admin/orders/[id]/UpdateOrderStatusForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { updateOrderStatus } from "@/app/actions/orderActions";

type UpdateOrderStatusFormProps = {
  id: string;
  currentStatus: string;
};

export default function UpdateOrderStatusForm({
  id,
  currentStatus,
}: UpdateOrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === currentStatus) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("status", status);

      const result = await updateOrderStatus(formData);

      if (result.success) {
        setSuccess("Order status updated successfully");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update order status");
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
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Update Status
        </label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || status === currentStatus}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <FaSpinner className="animate-spin mr-2" /> Updating...
          </>
        ) : (
          "Update Status"
        )}
      </button>
    </form>
  );
}
