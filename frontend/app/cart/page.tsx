'use client'

import Link from 'next/link'
import {useCart} from '@/app/context/CartContext'
import SanityImage from '@/app/components/SanityImage'

export default function CartPage() {
  const {items, removeFromCart, updateQuantity, getTotalPrice, getTotalItems} = useCart()
  const total = getTotalPrice()
  const itemCount = getTotalItems()

  const currencySymbol = items[0]?.currency === 'USD' ? '$' : 
                        items[0]?.currency === 'EUR' ? '€' : 
                        items[0]?.currency === 'GBP' ? '£' : '$'

  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden pt-24">
      {/* Gradient spots */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[1000px] h-[1000px] bg-[#FFB81C]/[0.03] rounded-full blur-3xl -top-60 -left-60" />
        <div className="absolute w-[1200px] h-[1200px] bg-[#FA4616]/[0.03] rounded-full blur-3xl -bottom-80 right-0" />
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold mb-8 text-large-upper bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">
          CART
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-yellow-200 text-xl mb-6">Your cart is empty</p>
            <Link
              href="/shop"
              className="inline-block bg-gradient-to-r from-[#FFB81C] to-[#FA4616] text-black font-bold py-3 px-8 rounded-lg text-lg uppercase hover:opacity-90 transition"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const imageRef = item.image?.asset?._ref || item.image?._ref
                const itemPrice = item.variant?.price || item.price
                const itemKey = item.variant?.sku ? `${item._id}-${item.variant.sku}` : item._id

                return (
                  <div
                    key={itemKey}
                    className="bg-black/60 border-2 border-yellow-400/30 rounded-lg p-6 flex flex-col md:flex-row gap-6"
                  >
                    {imageRef && (
                      <Link href={`/shop/${item.slug}`} className="flex-shrink-0">
                        <div className="w-32 h-32 bg-black border border-yellow-400/20 rounded overflow-hidden">
                          <SanityImage
                            id={imageRef}
                            width={128}
                            height={128}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            mode="cover"
                          />
                        </div>
                      </Link>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/shop/${item.slug}`}>
                          <h3 className="text-xl font-bold text-yellow-100 hover:text-yellow-300 transition mb-2">
                            {item.title}
                          </h3>
                        </Link>
                        {item.variant && (
                          <p className="text-yellow-200/70 text-sm mb-2">
                            {item.variant.name}
                          </p>
                        )}
                        <p className="text-yellow-400 font-bold text-lg">
                          {currencySymbol}{itemPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1, item.variant?.sku)}
                            className="w-8 h-8 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 rounded flex items-center justify-center font-bold transition"
                          >
                            −
                          </button>
                          <span className="text-yellow-100 font-bold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1, item.variant?.sku)}
                            className="w-8 h-8 bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 rounded flex items-center justify-center font-bold transition"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id, item.variant?.sku)}
                          className="text-red-400 hover:text-red-300 text-sm font-bold transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-black/60 border-2 border-yellow-400/30 rounded-lg p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-yellow-400 mb-6">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-yellow-200">
                    <span>Items ({itemCount})</span>
                    <span>{currencySymbol}{total.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-yellow-400/20 pt-4">
                    <div className="flex justify-between text-yellow-100 font-bold text-xl">
                      <span>Total</span>
                      <span>{currencySymbol}{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/checkout"
                  className="block w-full bg-gradient-to-r from-[#FFB81C] to-[#FA4616] text-black font-bold py-4 px-8 rounded-lg text-lg uppercase hover:opacity-90 transition text-center"
                >
                  Checkout
                </Link>
                <Link
                  href="/shop"
                  className="block text-center text-yellow-400 hover:text-yellow-300 mt-4 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
