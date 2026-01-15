'use client'

import {useEffect} from 'react'
import {useSearchParams} from 'next/navigation'
import Link from 'next/link'
import {useCart} from '@/app/context/CartContext'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const {clearCart} = useCart()

  useEffect(() => {
    // Clear cart on successful checkout
    if (sessionId) {
      clearCart()
    }
  }, [sessionId, clearCart])

  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden pt-24">
      {/* Gradient spots */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[1000px] h-[1000px] bg-[#FFB81C]/[0.03] rounded-full blur-3xl -top-60 -left-60" />
        <div className="absolute w-[1200px] h-[1200px] bg-[#FA4616]/[0.03] rounded-full blur-3xl -bottom-80 right-0" />
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 relative z-10">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-2xl">
            <div className="mb-6">
              <svg
                className="w-24 h-24 text-green-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-large-upper bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">
              PAYMENT SUCCESSFUL!
            </h1>
            <p className="text-yellow-200 text-xl mb-8">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            {sessionId && (
              <p className="text-yellow-200/70 text-sm mb-8">
                Order ID: {sessionId}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="inline-block bg-gradient-to-r from-[#FFB81C] to-[#FA4616] text-black font-bold py-3 px-8 rounded-lg text-lg uppercase hover:opacity-90 transition"
              >
                Continue Shopping
              </Link>
              <Link
                href="/"
                className="inline-block bg-yellow-400/20 text-yellow-400 border-2 border-yellow-400 font-bold py-3 px-8 rounded-lg text-lg uppercase hover:bg-yellow-400/30 transition"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
