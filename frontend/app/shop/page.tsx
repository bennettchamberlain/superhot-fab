import Link from 'next/link'
import {Metadata} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {allProductsQuery} from '@/sanity/lib/queries'
import SanityImage from '@/app/components/SanityImage'
import CartIcon from '@/app/components/CartIcon'

export const metadata: Metadata = {
  title: 'Shop Custom Fabrication Products',
  description: 'Browse our collection of custom fabricated products and metalworking solutions. Quality craftsmanship built to your specifications.',
  alternates: {
    canonical: 'https://superhotfab.com/shop',
  },
  openGraph: {
    title: 'Shop Custom Fabrication Products | Superhot Fabrication',
    description: 'Browse our collection of custom fabricated products and metalworking solutions. Quality craftsmanship built to your specifications.',
    url: 'https://superhotfab.com/shop',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shop Custom Fabrication Products | Superhot Fabrication',
    description: 'Browse our collection of custom fabricated products and metalworking solutions.',
  },
}

export default async function ShopPage() {
  let products: any[] = []
  let error: Error | null = null
  
  try {
    const result = await sanityFetch({
      query: allProductsQuery,
      perspective: 'published',
      stega: false,
    })
    products = Array.isArray(result?.data) ? result.data : []
  } catch (err) {
    console.error('Error fetching products:', err)
    error = err instanceof Error ? err : new Error('Failed to fetch products')
  }

  if (error) {
    throw error
  }

  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden pt-24">
      {/* Gradient spots */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[1000px] h-[1000px] bg-[#FFB81C]/[0.03] rounded-full blur-3xl -top-60 -left-60" />
        <div className="absolute w-[1200px] h-[1200px] bg-[#FA4616]/[0.03] rounded-full blur-3xl -bottom-80 right-0" />
        <div className="absolute w-[1100px] h-[1100px] bg-[#DA291C]/[0.03] rounded-full blur-3xl -left-40 top-1/4" />
      </div>

      <div className="container mx-auto px-4 md:px-8 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-large-upper bg-gradient-to-r from-[#FFB81C] to-[#FA4616] bg-clip-text text-transparent">
            SHOP
          </h1>
          <CartIcon />
        </div>
        <p className="text-yellow-100 text-center text-lg mb-12 max-w-2xl mx-auto">
          Explore our custom fabrication products
        </p>

        {!products || products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-yellow-200 text-xl">No products available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {products
              .filter((product: any) => product?.slug) // Filter out products without slugs
              .map((product: any) => {
              const image = product.primaryImage || product.thumbnailImage || product.firstImage
              const imageRef = image?.asset?._ref || image?._ref
              const imageAlt = image?.alt || product.title || 'Product image'
              const price = product.pricing?.salePrice || product.pricing?.basePrice
              const originalPrice = product.pricing?.salePrice ? product.pricing?.basePrice : null
              const currencySymbol = product.pricing?.currency === 'USD' ? '$' : 
                                    product.pricing?.currency === 'EUR' ? '€' : 
                                    product.pricing?.currency === 'GBP' ? '£' : '$'

              return (
                <Link
                  key={product._id}
                  href={`/shop/${product.slug}`}
                  className="group bg-black/60 border-2 border-yellow-400/30 hover:border-yellow-400 transition-all duration-300 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-yellow-400/20"
                >
                  <div className="relative aspect-square overflow-hidden bg-black">
                    {imageRef ? (
                      <SanityImage
                        id={imageRef}
                        width={400}
                        height={400}
                        alt={imageAlt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        mode="cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900">
                        <span className="text-yellow-400/50 text-4xl">📦</span>
                      </div>
                    )}
                    {product.isNew && (
                      <div className="absolute top-2 left-2 bg-[#FFB81C] text-black px-3 py-1 rounded-full text-xs font-bold uppercase">
                        New
                      </div>
                    )}
                    {product.isOnSale && (
                      <div className="absolute top-2 right-2 bg-[#FA4616] text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                        Sale
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FFB81C] to-[#FA4616] text-black px-3 py-1 rounded-full text-xs font-bold uppercase">
                        ⭐ Featured
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-bold text-yellow-100 mb-2 group-hover:text-yellow-300 transition line-clamp-2">
                      {product.title}
                    </h2>
                    {product.shortDescription && (
                      <p className="text-yellow-200/70 text-sm mb-3 line-clamp-2">
                        {product.shortDescription}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {price !== undefined && price != null && typeof price === 'number' && (
                          <>
                            <span className="text-2xl font-bold text-yellow-400">
                              {currencySymbol}{price.toFixed(2)}
                            </span>
                            {originalPrice && typeof originalPrice === 'number' && (
                              <span className="text-sm text-yellow-200/50 line-through">
                                {currencySymbol}{originalPrice.toFixed(2)}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {product.reviewCount > 0 && product.averageRating != null && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm text-yellow-200">
                            {typeof product.averageRating === 'number' ? product.averageRating.toFixed(1) : '0.0'} ({product.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
