// src/components/providers/CartProvider.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "react-hot-toast";
import {
  addToCart,
  removeFromCart,
  clearCart as clearCartAction,
  getCart,
} from "@/app/actions/cartActions";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  itemCount: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize cart from server
  useEffect(() => {
    const initializeCart = async () => {
      try {
        const cartData = await getCart();
        if (cartData) {
          // Ensure all items have the correct types
          const formattedCart = cartData.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image,
          }));
          setItems(formattedCart);
        }
      } catch (error) {
        console.error("Failed to initialize cart:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeCart();
  }, []);

  // Add item to cart
  const addItem = async (item: CartItem) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", item.id);
      formData.append("name", item.name);
      formData.append("price", item.price.toString());
      formData.append("quantity", item.quantity.toString());
      if (item.image) {
        formData.append("image", item.image);
      }

      const result = await addToCart(formData);

      if (result.success) {
        const updatedCart = await getCart();
        if (updatedCart) {
          const formattedCart = updatedCart.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image,
          }));
          setItems(formattedCart);
        }
        toast.success(`Added ${item.name} to cart`);
      } else {
        toast.error("Failed to add item to cart");
        console.error("Failed to add item to cart:", result.error);
      }
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error("Failed to add item to cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (id: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id);

      const result = await removeFromCart(formData);

      if (result.success) {
        const updatedCart = await getCart();
        if (updatedCart) {
          const formattedCart = updatedCart.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image,
          }));
          setItems(formattedCart);
        } else {
          setItems([]);
        }
        toast.success("Item removed from cart");
      } else {
        toast.error("Failed to remove item from cart");
        console.error("Failed to remove item from cart:", result.error);
      }
    } catch (error) {
      toast.error("Failed to remove item from cart");
      console.error("Failed to remove item from cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("quantity", quantity.toString());

      // Find the item to update
      const itemToUpdate = items.find((item) => item.id === id);
      if (!itemToUpdate) {
        throw new Error("Item not found in cart");
      }

      // Create a new FormData with all the required fields
      const fullFormData = new FormData();
      fullFormData.append("id", id);
      fullFormData.append("name", itemToUpdate.name);
      fullFormData.append("price", itemToUpdate.price.toString());
      fullFormData.append("quantity", quantity.toString());
      if (itemToUpdate.image) {
        fullFormData.append("image", itemToUpdate.image);
      }

      // Remove the item first
      await removeFromCart(formData);

      // Then add it back with the new quantity
      const result = await addToCart(fullFormData);

      if (result.success) {
        const updatedCart = await getCart();
        if (updatedCart) {
          const formattedCart = updatedCart.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            image: item.image,
          }));
          setItems(formattedCart);
        }
        toast.success("Cart updated");
      } else {
        toast.error("Failed to update cart");
        console.error("Failed to update cart:", result.error);
      }
    } catch (error) {
      toast.error("Failed to update cart");
      console.error("Failed to update cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    setIsLoading(true);
    try {
      const result = await clearCartAction();

      if (result.success) {
        setItems([]);
        toast.success("Cart cleared");
      } else {
        toast.error("Failed to clear cart");
        console.error("Failed to clear cart:", result.error);
      }
    } catch (error) {
      toast.error("Failed to clear cart");
      console.error("Failed to clear cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading,
        itemCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
