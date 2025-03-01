// app/admin/categories/DeleteCategoryButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaSpinner } from "react-icons/fa";
import { deleteCategory } from "@/app/actions/categoryActions";
import { toast } from "react-hot-toast"; 

type DeleteCategoryButtonProps = {
  id: string;
  name: string;
};

export default function DeleteCategoryButton({
  id,
  name,
}: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      // Fix: Pass the id directly instead of using FormData
      const result = await deleteCategory(id);

      if (result.success) {
        router.refresh();
        setShowConfirm(false);
      } else {
        throw new Error(result.error || "Failed to delete category");
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-900"
        title="Delete Category"
      >
        <FaTrash />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the category "{name}"? This action
              cannot be undone.
            </p>
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
