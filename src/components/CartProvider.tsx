'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
    productId: string;
    priceId: string;
    name: string;
    variant?: string;
    price: number; // in cents
    quantity: number;
    image?: string;
    weight?: number;
    packageSize?: string;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (priceId: string) => void;
    updateQuantity: (priceId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cueism_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setCartOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(CART_STORAGE_KEY);
            if (saved) {
                setItems(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load cart:', e);
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = useCallback((item: CartItem) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.priceId === item.priceId);
            if (existing) {
                return prev.map((i) =>
                    i.priceId === item.priceId
                        ? { ...i, quantity: i.quantity + item.quantity }
                        : i
                );
            }
            return [...prev, item];
        });
        setCartOpen(true);
    }, []);

    const removeItem = useCallback((priceId: string) => {
        setItems((prev) => prev.filter((i) => i.priceId !== priceId));
    }, []);

    const updateQuantity = useCallback((priceId: string, quantity: number) => {
        if (quantity < 1) {
            setItems((prev) => prev.filter((i) => i.priceId !== priceId));
            return;
        }
        setItems((prev) =>
            prev.map((i) => (i.priceId === priceId ? { ...i, quantity } : i))
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
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
                totalItems,
                totalPrice,
                isCartOpen,
                setCartOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
