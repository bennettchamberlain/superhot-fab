'use client'

import React, {createContext, useContext, useState, useEffect, useCallback} from 'react'

export interface CartItem {
  _id: string
  title: string
  slug: string
  price: number
  currency: string
  image?: {
    asset?: {_ref: string}
    _ref?: string
    alt?: string
  }
  variant?: {
    name: string
    sku: string
    price?: number
  }
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  removeFromCart: (itemId: string, variantSku?: string) => void
  updateQuantity: (itemId: string, quantity: number, variantSku?: string) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({children}: {children: React.ReactNode}) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const getItemKey = (itemId: string, variantSku?: string) => {
    return variantSku ? `${itemId}-${variantSku}` : itemId
  }

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems((prevItems) => {
      const itemKey = getItemKey(item._id, item.variant?.sku)
      const existingItem = prevItems.find(
        (i) => getItemKey(i._id, i.variant?.sku) === itemKey
      )

      if (existingItem) {
        return prevItems.map((i) =>
          getItemKey(i._id, i.variant?.sku) === itemKey
            ? {...i, quantity: i.quantity + 1}
            : i
        )
      }

      return [...prevItems, {...item, quantity: 1}]
    })
  }, [])

  const removeFromCart = useCallback((itemId: string, variantSku?: string) => {
    setItems((prevItems) =>
      prevItems.filter((i) => getItemKey(i._id, i.variant?.sku) !== getItemKey(itemId, variantSku))
    )
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number, variantSku?: string) => {
    if (quantity <= 0) {
      removeFromCart(itemId, variantSku)
      return
    }

    setItems((prevItems) =>
      prevItems.map((i) =>
        getItemKey(i._id, i.variant?.sku) === getItemKey(itemId, variantSku)
          ? {...i, quantity}
          : i
      )
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => {
      const itemPrice = item.variant?.price || item.price
      return total + itemPrice * item.quantity
    }, 0)
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
