import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { addToast } = useToast();
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cafeteria_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('cafeteria_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((i) => i.food_id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            food_id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity,
            image_url: item.image_url,
            prep_time_minutes: item.prep_time_minutes,
            is_veg: item.is_veg
          }
        ];
      }
    });
    addToast(`Added "${item.name}" to cart`, 'success', 2500);
  };

  const updateQuantity = (foodId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.food_id === foodId ? { ...i, quantity: newQty } : i))
    );
  };

  const removeFromCart = (foodId) => {
    setCart((prev) => prev.filter((i) => i.food_id !== foodId));
    addToast('Item removed from cart', 'info', 2000);
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = +cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  const taxAmount = +(subtotal * 0.05).toFixed(2);
  const finalAmount = +(subtotal + taxAmount).toFixed(2);
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        subtotal,
        taxAmount,
        finalAmount,
        totalCount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
