// src/components/ui/EmptyState.tsx
import React from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
};

export default function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
        {icon}
      </div>
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 mb-6">{description}</p>
      {action}
    </div>
  );
}