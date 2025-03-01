"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart as clearCartAction,
} from "@/app/actions/cartActions";

type CartItem = {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: CartItem) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate total and item count
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Load cart from cookies on client side
  useEffect(() => {
    const loadCart = async () => {
      try {
        setIsLoading(true);
        const cartItems = await getCart();
        setItems(cartItems);
      } catch (error) {
        console.error("Error loading cart:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Add item to cart
  const addItem = async (item: CartItem) => {
    try {
      setIsLoading(true);

      // Optimistically update UI
      const existingItemIndex = items.findIndex((i) => i.id === item.id);
      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        newItems = [...items];
        newItems[existingItemIndex].quantity += item.quantity;
      } else {
        // Add new item
        newItems = [...items, item];
      }

      setItems(newItems);

      // Submit form data to server action
      const formData = new FormData();
      formData.append("id", item.id);
      formData.append("name", item.name);
      formData.append("price", item.price.toString());
      if (item.image) {
        formData.append("image", item.image);
      }
      formData.append("quantity", item.quantity.toString());

      // Call server action
      const result = await addToCart(formData);

      if ("error" in result) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      // Revert optimistic update on error
      const cartItems = await getCart();
      setItems(cartItems);
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      setIsLoading(true);

      // Optimistically update UI
      const newItems = items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      setItems(newItems);

      // Submit form data to server action
      const formData = new FormData();
      formData.append("id", id);
      formData.append("quantity", quantity.toString());

      // Call server action
      const result = await updateCartItemQuantity(null, formData);

      if ("error" in result) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      // Revert optimistic update on error
      const cartItems = await getCart();
      setItems(cartItems);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (id: string) => {
    try {
      setIsLoading(true);

      // Optimistically update UI
      const newItems = items.filter((item) => item.id !== id);
      setItems(newItems);

      // Submit form data to server action
      const formData = new FormData();
      formData.append("id", id);

      // Call server action
      const result = await removeFromCart(formData);

      if ("error" in result) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      // Revert optimistic update on error
      const cartItems = await getCart();
      setItems(cartItems);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      setIsLoading(true);

      // Optimistically update UI
      setItems([]);

      // Call server action
      const result = await clearCartAction();

      if ("error" in result) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Revert optimistic update on error
      const cartItems = await getCart();
      setItems(cartItems);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        total,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
