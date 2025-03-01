// src/components/products/ProductReviews.tsx
import { formatDate } from "@/lib/utils";
import ProductRating from "./ProductRating";

export default function ProductReviews({ 
  reviews, 
  productId 
}: { 
  reviews: any[]; 
  productId: string;
}) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg">{review.user.name}</h3>
              <ProductRating rating={review.rating} reviewCount={0} />
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(review.createdAt)}
            </div>
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
}