
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product, CartItem } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Set cart data to expire after 90 days (in milliseconds)
const CART_EXPIRATION = 90 * 24 * 60 * 60 * 1000;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCartJSON = localStorage.getItem('cart');
    if (savedCartJSON) {
      try {
        const savedCart = JSON.parse(savedCartJSON);
        const now = new Date().getTime();
        
        // Check if the cart data has a timestamp and if it has expired
        if (savedCart.timestamp && (now - savedCart.timestamp > CART_EXPIRATION)) {
          // Cart has expired, clear it
          localStorage.removeItem('cart');
          setItems([]);
        } else {
          // Cart is valid, load the items
          setItems(savedCart.items || []);
        }
      } catch (error) {
        // If parsing fails, it might be old format data. Clear it.
        localStorage.removeItem('cart');
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    // Save items along with the current timestamp
    const cartToSave = {
      items: items,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem('cart', JSON.stringify(cartToSave));
  }, [items]);

  const addToCart = (product: Product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
