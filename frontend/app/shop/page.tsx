import Link from 'next/link'
import {Metadata} from 'next'
import {sanityFetch} from '@/sanity/lib/live'
import {allProductsQuery} from '@/sanity/lib/queries'
import SanityImage from '@/app/components/SanityImage'
import CartIcon from '@/app/components/CartIcon'

export const metadata: Metadata = {
  title: 'Shop | Superhot Fabrication',
  description: 'Browse our collection of custom fabrication products',
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

  if (error) throw error

  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden">
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-24">

        {/* Header */}
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-white/30 mb-3">Fabrication</p>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tight text-white leading-none">
              SHOP
            </h1>
            <div className="mt-6 h-px w-24 bg-white/20" />
          </div>
          <CartIcon />
        </div>

        {!products || products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <p className="text-white/20 text-xs tracking-[0.4em] uppercase">No products available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/10">
            {products
              .filter((product: any) => product?.slug)
              .map((product: any) => {
                const image = product.primaryImage || product.thumbnailImage || product.firstImage
                const imageRef = image?.asset?._ref || image?._ref
                const imageAlt = image?.alt || product.title || 'Product image'
                const price = product.pricing?.salePrice || product.pricing?.basePrice
                const originalPrice = product.pricing?.salePrice ? product.pricing?.basePrice : null
                const currencySymbol = product.pricing?.currency === 'EUR' ? '€' : product.pricing?.currency === 'GBP' ? '£' : '$'

                return (
                  <Link
                    key={product._id}
                    href={`/shop/${product.slug}`}
                    className="group bg-black flex flex-col overflow-hidden hover:bg-white/5 transition-colors duration-300"
                  >
                    <div className="relative aspect-square overflow-hidden bg-zinc-950">
                      {imageRef ? (
                        <SanityImage
                          id={imageRef}
                          width={400}
                          height={400}
                          alt={imageAlt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          mode="cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                          <span className="text-white/10 text-4xl">—</span>
                        </div>
                      )}
                      {product.isNew && (
                        <div className="absolute top-3 left-3 bg-white text-black px-2 py-0.5 text-xs font-black uppercase tracking-widest">
                          New
                        </div>
                      )}
                      {product.isOnSale && (
                        <div className="absolute top-3 right-3 bg-white text-black px-2 py-0.5 text-xs font-black uppercase tracking-widest">
                          Sale
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col gap-2 border-t border-white/10">
                      <h2 className="text-sm font-black uppercase tracking-widest text-white line-clamp-1 group-hover:text-white/70 transition-colors">
                        {product.title}
                      </h2>
                      {product.shortDescription && (
                        <p className="text-white/30 text-xs line-clamp-2 leading-relaxed">
                          {product.shortDescription}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-2">
                          {price != null && typeof price === 'number' && (
                            <>
                              <span className="text-white font-black text-sm">
                                {currencySymbol}{price.toFixed(2)}
                              </span>
                              {originalPrice && typeof originalPrice === 'number' && (
                                <span className="text-white/30 text-xs line-through">
                                  {currencySymbol}{originalPrice.toFixed(2)}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        {product.reviewCount > 0 && product.averageRating != null && (
                          <span className="text-white/30 text-xs">
                            {typeof product.averageRating === 'number' ? product.averageRating.toFixed(1) : '0.0'} ({product.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
          </div>
        )}
      </div>

      <footer className="relative z-10 w-full py-6 text-center text-white/20 text-xs tracking-widest uppercase border-t border-white/10 mt-8">
        © {new Date().getFullYear()} Superhot Fabrication
      </footer>
    </main>
  )
}
