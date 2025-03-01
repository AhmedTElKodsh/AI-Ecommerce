// src/components/products/ProductRating.tsx
"use client";

import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function ProductRating({ 
  rating, 
  reviewCount 
}: { 
  rating: number; 
  reviewCount: number;
}) {
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

  return (
    <div className="flex items-center mb-4">
      {renderRatingStars(rating)}
      <span className="ml-2 text-gray-600">
        {rating.toFixed(1)} ({reviewCount}{" "}
        {reviewCount === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}