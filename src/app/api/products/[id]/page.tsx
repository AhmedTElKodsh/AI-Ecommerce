"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/CartProvider";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShoppingCart,
  FaHeart,
  FaSpinner,
  FaArrowLeft,
} from "react-icons/fa";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  avgRating: number;
  reviewCount: number;
  category: {
    id: string;
    name: string;
  };
  reviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
    };
  }[];
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCart();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found");
          }
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (product && value > product.stock) {
      setQuantity(product.stock);
    } else {
      setQuantity(value);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        quantity,
      });
      
      // Show success message or navigate to cart
      setTimeout(() => {
        router.push('/cart');
      }, 500);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  // Render star ratings
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return <div className="flex">{stars}</div>;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          {error}
        </div>
        <Link
          href="/products"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to products
        </Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/products"
        className="text-indigo-600 hover:text-indigo-800 flex items-center mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to products
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
                No image available
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                    selectedImage === index
                      ? "border-indigo-600"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>

          <div className="flex items-center mb-4">
            <Link
              href={`/categories?category=${product.category.id}`}
              className="text-indigo-600 hover:underline"
            >
              {product.category.name}
            </Link>
          </div>

          <div className="flex items-center mb-4">
            {renderRatingStars(product.avgRating)}
            <span className="ml-2 text-gray-600">
              {product.avgRating.toFixed(1)} ({product.reviewCount}{" "}
              {product.reviewCount === 1 ? "review" : "reviews"})
            </span>
          </div>

          <div className="text-2xl font-bold text-gray-900 mb-4">
            ${product.price.toFixed(2)}
          </div>

          <div className="mb-6">
            <p className="text-gray-700 whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="mb-6">
            <div className="text-sm text-gray-700 mb-2">Availability:</div>
            {product.stock > 0 ? (
              <div className="text-green-600">
                In Stock ({product.stock}{" "}
                {product.stock === 1 ? "item" : "items"} available)
              </div>
            ) : (
              <div className="text-red-600">Out of Stock</div>
            )}
          </div>

          {product.stock > 0 && (
            <div className="flex items-center mb-6">
              <div className="mr-4">
                <label
                  htmlFor="quantity"
                  className="block text-sm text-gray-700 mb-1"
                >
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 border border-gray-300 rounded-l-md bg-gray-100 hover:bg-gray-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={handleQuantityChange}
                    min="1"
                    max={product.stock}
                    className="w-16 text-center py-1 border-t border-b border-gray-300"
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="px-3 py-1 border border-gray-300 rounded-r-md bg-gray-100 hover:bg-gray-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-md text-white ${
                product.stock === 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {addingToCart ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaShoppingCart className="mr-2" />
              )}
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <button className="px-4 py-3 rounded-md border border-gray-300 hover:bg-gray-50">
              <FaHeart className="text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {product.reviews.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-md text-center">
            <p className="text-gray-600 mb-4">
              This product has no reviews yet.
            </p>
            {session ? (
              <Link
                href={`/products/${product.id}/review`}
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Be the first to review
              </Link>
            ) : (
              <Link
                href={`/login?callbackUrl=/products/${product.id}/review`}
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Login to review
              </Link>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <span className="text-gray-600">
                  {product.reviews.length}{" "}
                  {product.reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>

              {session && (
                <Link
                  href={`/products/${product.id}/review`}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Write a Review
                </Link>
              )}
            </div>

            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      {renderRatingStars(review.rating)}
                      <span className="ml-2 font-medium">
                        {review.user.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
