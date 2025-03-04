// src/components/layout/UserMenu.tsx
"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { FaUser, FaSignOutAlt, FaUserCog, FaShoppingBag } from "react-icons/fa";
// src/components/layout/UserMenu.tsx
import { User } from "next-auth";
import { FC } from "react";

// Define the UserMenuProps interface with the user property
export interface UserMenuProps {
  user?: User & {
    id: string;
    role: string;
  };
}

export const UserMenu: FC<UserMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Extract user information with fallbacks for undefined values
  const userName = user?.name || "Guest";
  const userRole = user?.role || "USER";

  return (
    <div className="relative">
      {/* Your menu trigger button */}
      <button onClick={() => setIsOpen(!isOpen)}>{/* Button content */}</button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-4 py-3 text-sm text-gray-900 border-b border-gray-200">
            <div className="font-medium truncate">{userName}</div>
            <div className="truncate text-gray-500">{userRole}</div>
          </div>

          {/* Menu links */}
          {userRole === "ADMIN" && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              onClick={() => setIsOpen(false)}
            >
              <FaUserCog className="mr-2" /> Admin Dashboard
            </Link>
          )}

          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
          >
            <FaSignOutAlt className="mr-2" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
