// src/app/about/page.tsx
import Image from "next/image";
import Link from "next/link";
import {
  FaShoppingCart,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
} from "react-icons/fa";

export const metadata = {
  title: "About Us | ShopNext",
  description: "Learn more about ShopNext and our mission",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">About ShopNext</h1>

      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-700 mb-6">
              ShopNext was founded with a simple mission: to provide
              high-quality products with exceptional customer service. We
              believe shopping should be easy, enjoyable, and accessible to
              everyone.
            </p>
            <p className="text-gray-700">
              Since our inception, we've been committed to curating a diverse
              collection of products that meet our customers' needs while
              maintaining the highest standards of quality and sustainability.
            </p>
          </div>
          <div className="md:w-1/2 relative h-64 md:h-auto">
            <Image
              src="https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=800&q=80"
              alt="ShopNext store"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <FaShoppingCart className="text-indigo-600 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Products</h3>
            <p className="text-gray-600">
              We carefully select each product in our inventory to ensure it
              meets our high standards of quality and value.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <FaShieldAlt className="text-indigo-600 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Shopping</h3>
            <p className="text-gray-600">
              Your security is our priority. We use the latest technology to
              protect your personal and payment information.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <FaTruck className="text-indigo-600 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              We partner with reliable shipping carriers to ensure your orders
              are delivered promptly and in perfect condition.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <FaHeadset className="text-indigo-600 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Customer Support</h3>
            <p className="text-gray-600">
              Our dedicated support team is always ready to assist you with any
              questions or concerns about your purchase.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-8 text-center">Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-64">
                <Image
                  src={`https://randomuser.me/api/portraits/${
                    i % 2 === 0 ? "women" : "men"
                  }/${i + 10}.jpg`}
                  alt={`Team member ${i}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold mb-1">
                  {i === 1
                    ? "Jane Smith"
                    : i === 2
                    ? "John Doe"
                    : "Emily Johnson"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {i === 1
                    ? "Founder & CEO"
                    : i === 2
                    ? "CTO"
                    : "Head of Customer Service"}
                </p>
                <p className="text-gray-700">
                  {i === 1
                    ? "Jane founded ShopNext with a vision to revolutionize online shopping."
                    : i === 2
                    ? "John oversees all technical aspects of the ShopNext platform."
                    : "Emily ensures our customers always receive exceptional service."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 text-white rounded-lg shadow-md p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Start Shopping?</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Explore our wide selection of products and experience the ShopNext
          difference. From everyday essentials to unique finds, we've got you
          covered.
        </p>
        <Link
          href="/products"
          className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition"
        >
          Browse Products
        </Link>
      </div>
    </div>
  );
}
