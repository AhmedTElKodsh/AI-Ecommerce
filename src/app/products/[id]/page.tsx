// src/app/products/[id]/page.tsx
import { getProductById } from "@/app/actions/productActions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductAddToCart from "@/components/products/ProductAddToCart";
import ProductRating from "@/components/products/ProductRating";
import ProductReviews from "@/components/products/ProductReviews";
import { FaArrowLeft } from "react-icons/fa";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { product, success } = await getProductById(params.id);
  
  if (!success || !product) {
    return {
      title: "Product Not Found | ShopNext",
      description: "The requested product could not be found",
    };
  }
  
  return {
    title: `${product.name} | ShopNext`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { product, success, error } = await getProductById(params.id);
  
  if (!success || !product) {
    notFound();
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
        <ProductImageGallery
          images={product.images}
          productName={product.name}
        />

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">{product.name}</h1>

          <div className="flex items-center mb-4">
            <Link
              href={`/products?category=${product.category.id}`}
              className="text-indigo-600 hover:underline"
            >
              {product.category.name}
            </Link>
          </div>

          <ProductRating
            rating={product.avgRating}
            reviewCount={product.reviews.length}
          />

          <div className="text-2xl font-bold text-black mb-4">
            ${product.price.toFixed(2)}
          </div>

          <div className="mb-6">
            <p className="text-black whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <ProductAddToCart product={product} />
        </div>
      </div>

      {/* Product Reviews */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <ProductReviews reviews={product.reviews} productId={product.id} />
      </div>
    </div>
  );
}