import { getProductById } from "@/app/actions/productActions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaStar, FaStarHalfAlt, FaRegStar, FaArrowLeft } from "react-icons/fa";
import AddToCartForm from "./AddToCartForm";
import { auth } from "@/auth";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { product, success } = await getProductById(params.id);

  if (!success || !product) {
    return {
      title: "Product Not Found | ShopNext",
      description: "The requested product could not be found.",
    };
  }

  return {
    title: `${product.name} | ShopNext`,
    description:
      product.description?.substring(0, 160) ||
      `Buy ${product.name} at ShopNext`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { product, success, error } = await getProductById(params.id);
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  if (!success || !product) {
    notFound();
  }

  // Calculate average rating
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : 0;

  // Generate rating stars
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }

    return stars;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/products"
          className="text-indigo-600 hover:text-indigo-800 flex items-center"
        >
          <FaArrowLeft className="mr-2" /> Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Product Images */}
          <div className="md:w-1/2">
            <div className="relative h-96 md:h-full">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex p-4 space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative w-20 h-20 flex-shrink-0 border rounded-md overflow-hidden"
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              {isAdmin && (
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Edit
                </Link>
              )}
            </div>

            <div className="flex items-center mb-4">
              <div className="flex mr-2">{renderRatingStars(avgRating)}</div>
              <span className="text-gray-600">
                {product.reviews && product.reviews.length > 0
                  ? `${avgRating.toFixed(1)} (${
                      product.reviews.length
                    } reviews)`
                  : "No reviews yet"}
              </span>
            </div>

            <div className="text-2xl font-bold text-indigo-600 mb-4">
              ${product.price.toFixed(2)}
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Category</h2>
              {product.category ? (
                <Link
                  href={`/categories/${product.category.id}`}
                  className="inline-block bg-gray-100 px-3 py-1 rounded-full text-gray-800 hover:bg-gray-200"
                >
                  {product.category.name}
                </Link>
              ) : (
                <span className="text-gray-500">Uncategorized</span>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Availability</h2>
              {product.stock > 0 ? (
                <span className="text-green-600">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Add to Cart Form */}
            {product.stock > 0 ? (
              <AddToCartForm product={product} />
            ) : (
              <div className="bg-gray-100 p-4 rounded-md text-gray-700">
                This product is currently out of stock. Please check back later.
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

          {!product.reviews || product.reviews.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-md text-center">
              <p className="text-gray-600 mb-4">
                This product has no reviews yet.
              </p>
              {session ? (
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                  Be the first to review
                </button>
              ) : (
                <Link
                  href={`/login?callbackUrl=/products/${product.id}`}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Log in to leave a review
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">
                        {review.user?.name || "Anonymous"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
