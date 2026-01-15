'use client'

import {useState} from 'react'
import {useCart} from '@/app/context/CartContext'
import CartIcon from './CartIcon'
import {toast} from 'sonner'

interface AddToCartButtonProps {
  product: {
    _id: string
    title: string
    slug: string
    pricing?: {
      basePrice?: number
      salePrice?: number
      currency?: string
    }
    images?: Array<{
      image?: {
        asset?: {_ref: string}
        _ref?: string
        alt?: string
      }
      isPrimary?: boolean
      isThumbnail?: boolean
    }>
  }
  selectedVariant?: {
    name: string
    sku: string
    price?: number
  }
}

export default function AddToCartButton({product, selectedVariant}: AddToCartButtonProps) {
  const {addToCart} = useCart()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    const price = selectedVariant?.price || product.pricing?.salePrice || product.pricing?.basePrice
    
    if (price === undefined) {
      toast.error('Price not available')
      return
    }

    setIsAdding(true)
    
    const primaryImage = product.images?.find(img => img.isPrimary || img.isThumbnail)?.image || product.images?.[0]?.image

    addToCart({
      _id: product._id,
      title: product.title,
      slug: product.slug,
      price,
      currency: product.pricing?.currency || 'USD',
      image: primaryImage,
      variant: selectedVariant,
      quantity: 1,
    })

    toast.success(`${product.title} added to cart!`)
    
    setTimeout(() => {
      setIsAdding(false)
    }, 500)
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="flex-1 bg-gradient-to-r from-[#FFB81C] to-[#FA4616] text-black font-bold py-4 px-8 rounded-lg text-lg uppercase hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </button>
      <CartIcon />
    </div>
  )
}
