import Image from "next/image";
import { FaTrash } from "react-icons/fa";
import { CartItem } from "@/components/providers/CartProvider";

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export default function CartItemComponent({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = parseInt(e.target.value);
    onUpdateQuantity(newQuantity);
  };

  return (
    <div className="flex items-center p-4 border-b border-gray-200">
      <div className="w-20 h-20 relative flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover rounded"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>

      <div className="ml-4 flex-grow">
        <h3 className="font-medium text-gray-900">{item.name}</h3>
        <p className="text-gray-600">${item.price.toFixed(2)}</p>
      </div>

      <div className="flex items-center">
        <select
          value={item.quantity}
          onChange={handleQuantityChange}
          className="mr-4 p-2 border border-gray-300 rounded"
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>

        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 transition-colors"
          aria-label="Remove item"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
