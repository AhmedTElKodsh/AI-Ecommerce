// src/components/layout/Header.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/CartProvider";
import { FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-2"
          : "bg-white bg-opacity-90 py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            ShopNext
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`hover:text-indigo-600 ${
                pathname === "/" ? "text-indigo-600 font-medium" : "text-gray-700"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`hover:text-indigo-600 ${
                pathname === "/products" || pathname.startsWith("/products/")
                  ? "text-indigo-600 font-medium"
                  : "text-gray-700"
              }`}
            >
              Products
            </Link>
            <Link
              href="/categories"
              className={`hover:text-indigo-600 ${
                pathname === "/categories" || pathname.startsWith("/categories/")
                  ? "text-indigo-600 font-medium"
                  : "text-gray-700"
              }`}
            >
              Categories
            </Link>
            <Link
              href="/contact"
              className={`hover:text-indigo-600 ${
                pathname === "/contact"
                  ? "text-indigo-600 font-medium"
                  : "text-gray-700"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-indigo-600"
              aria-label="Shopping Cart"
            >
              <FaShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {session ? (
              <Link
                href="/profile"
                className="p-2 text-gray-700 hover:text-indigo-600"
                aria-label="User Profile"
              >
                <FaUser size={20} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700 hover:text-indigo-600"
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t mt-4">
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className={`block py-2 ${
                    pathname === "/" ? "text-indigo-600 font-medium" : "text-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className={`block py-2 ${
                    pathname === "/products" || pathname.startsWith("/products/")
                      ? "text-indigo-600 font-medium"
                      : "text-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className={`block py-2 ${
                    pathname === "/categories" || pathname.startsWith("/categories/")
                      ? "text-indigo-600 font-medium"
                      : "text-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className={`block py-2 ${
                    pathname === "/contact"
                      ? "text-indigo-600 font-medium"
                      : "text-gray-700"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </li>
              {!session && (
                <li>
                  <Link
                    href="/login"
                    className="block py-2 text-indigo-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}