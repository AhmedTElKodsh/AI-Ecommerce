import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    images?: string[];
    categoryName?: string;
    stock?: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, images, categoryName, stock } = product;
  const imageUrl = images && images.length > 0 ? images[0] : "/placeholder.png";

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link
        href={`/products/${id}`}
        className="block relative h-48 overflow-hidden"
      >
        <Image
          src={imageUrl || ""}
          alt={name}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
      </Link>
      <div className="p-4">
        {categoryName && (
          <div className="text-xs text-indigo-600 mb-1">{categoryName}</div>
        )}
        <Link href={`/products/${id}`}>
          <h3 className="font-medium text-gray-900 mb-1 hover:text-indigo-600 transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-gray-700 mb-3">${price.toFixed(2)}</p>
        <div className="flex justify-between items-center">
          <span
            className={`text-sm ${
              stock && stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {stock && stock > 0 ? `${stock} in stock` : "Out of stock"}
          </span>
          <AddToCartButton
            product={{
              id,
              name,
              price,
              stock,
              images: imageUrl ? [imageUrl] : [],
            }}
          />
        </div>
      </div>
    </div>
  );
}
