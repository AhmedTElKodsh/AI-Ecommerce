// app/admin/orders/[id]/UpdatePaymentStatusForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import { updatePaymentStatus } from "@/app/actions/orderActions";

type UpdatePaymentStatusFormProps = {
  id: string;
  currentStatus: string;
};

export default function UpdatePaymentStatusForm({
  id,
  currentStatus,
}: UpdatePaymentStatusFormProps) {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState(currentStatus);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentStatus === currentStatus) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("paymentStatus", paymentStatus);

      const result = await updatePaymentStatus(formData);

      if (result.success) {
        setSuccess("Payment status updated successfully");
        router.refresh();
      } else {
        throw new Error(result.error || "Failed to update payment status");
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
          htmlFor="paymentStatus"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Update Payment Status
        </label>
        <select
          id="paymentStatus"
          name="paymentStatus"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || paymentStatus === currentStatus}
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <FaSpinner className="animate-spin mr-2" /> Updating...
          </>
        ) : (
          "Update Payment Status"
        )}
      </button>
    </form>
  );
}
