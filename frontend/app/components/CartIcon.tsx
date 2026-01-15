'use client'

import Link from 'next/link'
import {useCart} from '@/app/context/CartContext'

export default function CartIcon() {
  const {getTotalItems} = useCart()
  const itemCount = getTotalItems()

  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center justify-center p-2 text-yellow-400 hover:text-yellow-300 transition-colors"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#FA4616] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  )
}
