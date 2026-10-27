"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem, Order, OrderType } from "@/types";
import { sound } from "@/lib/sound";

interface CartContextType {
  cart: CartItem[];
  tableNumber: string;
  customerName: string;
  orderType: OrderType;
  notes: string;
  activeOrder: Order | null;
  isCartOpen: boolean;
  cartCount: number;
  cartTotal: number;
  setTableNumber: (table: string) => void;
  setCustomerName: (name: string) => void;
  setOrderType: (type: OrderType) => void;
  setNotes: (notes: string) => void;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  setActiveOrder: (order: Order | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumberState] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [orderType, setOrderType] = useState<OrderType>("dine-in");
  const [notes, setNotes] = useState<string>("");
  const [activeOrder, setActiveOrderState] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Initialize from URL params or localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check URL search params for ?table=X
    const params = new URLSearchParams(window.location.search);
    const tableParam = params.get("table");
    if (tableParam) {
      setTableNumberState(tableParam);
      localStorage.setItem("elbahia_table", tableParam);
    } else {
      const savedTable = localStorage.getItem("elbahia_table");
      if (savedTable) {
        setTableNumberState(savedTable);
      }
    }

    const savedCart = localStorage.getItem("elbahia_cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {}
    }

    const savedOrder = localStorage.getItem("elbahia_active_order");
    if (savedOrder) {
      try {
        setActiveOrderState(JSON.parse(savedOrder));
      } catch {}
    }
  }, []);

  // Save cart to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("elbahia_cart", JSON.stringify(cart));
    }
  }, [cart]);

  const setTableNumber = (table: string) => {
    setTableNumberState(table);
    if (typeof window !== "undefined") {
      localStorage.setItem("elbahia_table", table);
    }
  };

  const setActiveOrder = (order: Order | null) => {
    setActiveOrderState(order);
    if (typeof window !== "undefined") {
      if (order) {
        localStorage.setItem("elbahia_active_order", JSON.stringify(order));
      } else {
        localStorage.removeItem("elbahia_active_order");
      }
    }
  };

  const addToCart = (item: CartItem) => {
    sound.playPop();
    setCart((prev) => {
      // Look for identical item with identical customizations
      const existingIndex = prev.findIndex(
        (i) =>
          i.menuItemId === item.menuItemId &&
          i.selectedSize?.id === item.selectedSize?.id &&
          i.selectedMeat?.id === item.selectedMeat?.id &&
          JSON.stringify(i.selectedSauces.sort()) === JSON.stringify(item.selectedSauces.sort()) &&
          JSON.stringify(i.selectedExtras.map((e) => e.id).sort()) ===
            JSON.stringify(item.selectedExtras.map((e) => e.id).sort()) &&
          i.specialInstructions === item.specialInstructions
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + item.quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: updated[existingIndex].unitPrice * newQty,
        };
        return updated;
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    sound.playPop();
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    sound.playPop();
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setNotes("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("elbahia_cart");
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        tableNumber,
        customerName,
        orderType,
        notes,
        activeOrder,
        isCartOpen,
        cartCount,
        cartTotal,
        setTableNumber,
        setCustomerName,
        setOrderType,
        setNotes,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        setActiveOrder,
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
