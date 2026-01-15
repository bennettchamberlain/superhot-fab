'use client'

import {useEffect, useState, useRef} from 'react'
import {useCart} from '@/app/context/CartContext'
import {loadStripe} from '@stripe/stripe-js'
import Link from 'next/link'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function CheckoutPage() {
  const {items} = useCart()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const checkoutRef = useRef<HTMLDivElement>(null)
  const checkoutInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (items.length === 0) {
      setError('Your cart is empty')
      setLoading(false)
      return
    }

    let mounted = true

    // Clean up any existing checkout instance before creating a new one
    if (checkoutInstanceRef.current) {
      try {
        checkoutInstanceRef.current.unmount()
      } catch (err) {
        console.error('Error unmounting existing checkout:', err)
      }
      checkoutInstanceRef.current = null
    }

    // Create checkout session and mount embedded checkout
    const initializeCheckout = async () => {
      try {
        // Create checkout session
        const sessionResponse = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items,
            currency: items[0]?.currency?.toLowerCase() || 'usd',
          }),
        })

        if (!sessionResponse.ok) {
          const errorData = await sessionResponse.json()
          throw new Error(errorData.error || 'Failed to create checkout session')
        }

        const sessionData = await sessionResponse.json()

        if (sessionData.error) {
          throw new Error(sessionData.error)
        }

        if (!sessionData.sessionId) {
          throw new Error('No session ID returned')
        }

        // Retrieve the checkout session to get the client secret
        const sessionSecretResponse = await fetch(`/api/checkout/session?session_id=${sessionData.sessionId}`)

        if (!sessionSecretResponse.ok) {
          const errorData = await sessionSecretResponse.json()
          throw new Error(errorData.error || 'Failed to retrieve checkout session')
        }

        const sessionSecretData = await sessionSecretResponse.json()

        if (sessionSecretData.error) {
          throw new Error(sessionSecretData.error)
        }

        if (!sessionSecretData.clientSecret) {
          throw new Error('No client secret returned')
        }

        // Load Stripe and mount embedded checkout
        const stripe = await stripePromise
        
        if (!stripe) {
          throw new Error('Failed to load Stripe')
        }

        if (!mounted) {
          return
        }

        // Wait for the ref to be available - use requestAnimationFrame to ensure DOM is ready
        const waitForRef = (): Promise<HTMLDivElement> => {
          return new Promise((resolve, reject) => {
            const checkRef = () => {
              if (checkoutRef.current) {
                resolve(checkoutRef.current)
              } else {
                requestAnimationFrame(checkRef)
              }
            }
            
            // Start checking after a brief delay to ensure component has rendered
            setTimeout(() => {
              let retries = 30
              const checkWithRetry = () => {
                if (checkoutRef.current) {
                  resolve(checkoutRef.current)
                } else if (retries > 0) {
                  retries--
                  requestAnimationFrame(checkWithRetry)
                } else {
                  reject(new Error('Checkout container not found after waiting'))
                }
              }
              checkWithRetry()
            }, 100)
          })
        }

        const container = await waitForRef()
        
        if (!mounted) {
          return
        }

        // Ensure no existing checkout instance before creating a new one
        if (checkoutInstanceRef.current) {
          try {
            checkoutInstanceRef.current.unmount()
          } catch (err) {
            console.error('Error unmounting existing checkout before creating new one:', err)
          }
          checkoutInstanceRef.current = null
        }

        const checkout = await stripe.initEmbeddedCheckout({
          clientSecret: sessionSecretData.clientSecret,
        })

        if (!mounted) {
          checkout.unmount()
          return
        }

        // Store the checkout instance in a ref
        checkoutInstanceRef.current = checkout

        checkout.mount(container)

        if (mounted) {
          setLoading(false)
        }
      } catch (err) {
        console.error('Error initializing checkout:', err)
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize checkout')
          setLoading(false)
        }
      }
    }

    initializeCheckout()

    return () => {
      mounted = false
      // Clean up checkout instance on unmount or when items change
      if (checkoutInstanceRef.current) {
        try {
          checkoutInstanceRef.current.unmount()
          checkoutInstanceRef.current = null
        } catch (err) {
          console.error('Error unmounting checkout:', err)
        }
      }
    }
  }, [items])

  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden pt-24">
      {/* Gradient spots */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[1000px] h-[1000px] bg-[#FFB81C]/[0.03] rounded-full blur-3xl -top-60 -left-60" />
        <div className="absolute w-[1200px] h-[1200px] bg-[#FA4616]/[0.03] rounded-full blur-3xl -bottom-80 right-0" />
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 relative z-10">
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Cart
          </Link>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold mb-8 text-large-upper bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">
          CHECKOUT
        </h1>

        <div className="max-w-4xl mx-auto">
          <div className="bg-black/60 border-2 border-yellow-400/30 rounded-lg p-6 md:p-8 relative">
            {error ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-yellow-400 mb-4">Checkout Error</h2>
                  <p className="text-yellow-200 text-xl mb-6">{error}</p>
                  <Link
                    href="/cart"
                    className="inline-block bg-gradient-to-r from-[#FFB81C] to-[#FA4616] text-black font-bold py-3 px-8 rounded-lg text-lg uppercase hover:opacity-90 transition"
                  >
                    Back to Cart
                  </Link>
                </div>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                  <p className="text-yellow-200 text-xl">Loading checkout...</p>
                </div>
              </div>
            ) : null}
            {/* Always render the ref container so it's available for mounting */}
            <div 
              ref={checkoutRef} 
              id="checkout" 
              className="overflow-hidden rounded-lg"
              style={{minHeight: loading ? '0' : 'auto'}}
            ></div>
          </div>
        </div>
      </div>
    </main>
  )
}
