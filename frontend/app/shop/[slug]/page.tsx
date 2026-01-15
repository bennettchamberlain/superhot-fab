import Link from 'next/link'
import {Metadata} from 'next'
import {notFound} from 'next/navigation'
import {sanityFetch} from '@/sanity/lib/live'
import {productQuery, productSlugs} from '@/sanity/lib/queries'
import SanityImage from '@/app/components/SanityImage'
import PortableText from '@/app/components/PortableText'
import AddToCartButton from '@/app/components/AddToCartButton'

type Props = {
  params: Promise<{slug: string}>
}

export async function generateStaticParams() {
  const {data: slugs} = await sanityFetch({
    query: productSlugs,
    perspective: 'published',
    stega: false,
  })
  return slugs?.map((item: {slug: string}) => ({slug: item.slug})) || []
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const {data: product} = await sanityFetch({
    query: productQuery,
    params,
    perspective: 'published',
    stega: false,
  })

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.title} | Shop`,
    description: product.shortDescription || product.excerpt || `Shop ${product.title} at Superhot Fabrication`,
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const {data: product} = await sanityFetch({
    query: productQuery,
    params,
  })

  if (!product) {
    notFound()
  }

  const primaryImage = product.primaryImage || product.images?.[0]?.image
  const primaryImageRef = primaryImage?.asset?._ref || primaryImage?._ref
  const primaryImageAlt = primaryImage?.alt || product.title || 'Product image'
  const price = product.pricing?.salePrice || product.pricing?.basePrice
  const originalPrice = product.pricing?.salePrice ? product.pricing?.basePrice : product.pricing?.compareAtPrice
  const currencySymbol = product.pricing?.currency === 'USD' ? '$' : 
                        product.pricing?.currency === 'EUR' ? '€' : 
                        product.pricing?.currency === 'GBP' ? '£' : '$'

  const approvedReviews = product.reviews?.filter((r: any) => r.isApproved) || []
  const featuredReviews = approvedReviews.filter((r: any) => r.isFeatured)

  return (
    <main className="min-h-screen w-full font-sans bg-black relative overflow-hidden pt-24">
      {/* Gradient spots */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute w-[1000px] h-[1000px] bg-[#FFB81C]/[0.03] rounded-full blur-3xl -top-60 -left-60" />
        <div className="absolute w-[1200px] h-[1200px] bg-[#FA4616]/[0.03] rounded-full blur-3xl -bottom-80 right-0" />
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 md:py-12 relative z-10">
        {/* Back Button */}
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {primaryImageRef && (
              <div className="relative aspect-square bg-black border-2 border-yellow-400/30 rounded-lg overflow-hidden">
                <SanityImage
                  id={primaryImageRef}
                  width={800}
                  height={800}
                  alt={primaryImageAlt}
                  className="w-full h-full object-cover"
                  mode="cover"
                />
              </div>
            )}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.slice(0, 4).map((img: any, idx: number) => {
                  const imgRef = img.image?.asset?._ref || img.image?._ref
                  return imgRef ? (
                    <div key={idx} className="relative aspect-square bg-black border border-yellow-400/20 rounded overflow-hidden">
                      <SanityImage
                        id={imgRef}
                        width={200}
                        height={200}
                        alt={img.alt || `${product.title} image ${idx + 1}`}
                        className="w-full h-full object-cover"
                        mode="cover"
                      />
                    </div>
                  ) : null
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isNew && (
                <span className="bg-[#FFB81C] text-black px-3 py-1 rounded-full text-sm font-bold uppercase">
                  New
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-gradient-to-r from-[#FFB81C] to-[#FA4616] text-black px-3 py-1 rounded-full text-sm font-bold uppercase">
                  ⭐ Featured
                </span>
              )}
              {product.brand && (
                <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold uppercase border border-yellow-400/30">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-100">
              {product.title}
            </h1>

            {/* Rating */}
            {product.reviewCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      {i < Math.round(product.averageRating) ? '⭐' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="text-yellow-200">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            {price !== undefined && (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-yellow-400">
                  {currencySymbol}{price.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-xl text-yellow-200/50 line-through">
                    {currencySymbol}{originalPrice.toFixed(2)}
                  </span>
                )}
                {product.pricing?.salePrice && (
                  <span className="bg-[#FA4616] text-white px-2 py-1 rounded text-sm font-bold">
                    SAVE {currencySymbol}{(originalPrice - price).toFixed(2)}
                  </span>
                )}
              </div>
            )}

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-lg text-yellow-200 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-yellow-400">Options</h3>
                {product.variants.map((variant: any, idx: number) => (
                  <div key={idx} className="border border-yellow-400/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-yellow-100">{variant.name}</span>
                      {variant.price && (
                        <span className="text-yellow-400 font-bold">
                          {currencySymbol}{variant.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {variant.options && variant.options.length > 0 && (
                      <div className="text-sm text-yellow-200/70">
                        {variant.options.map((opt: any, optIdx: number) => (
                          <span key={optIdx}>
                            {opt.optionType}: {opt.optionValue}
                            {optIdx < variant.options.length - 1 && ' • '}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add to Cart Button */}
            <AddToCartButton product={product} />

            {/* Shipping Info */}
            {product.shipping?.freeShipping && (
              <p className="text-yellow-400 text-center">✓ Free Shipping</p>
            )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Description</h2>
            <div className="prose prose-invert max-w-none [&_p]:text-yellow-200 [&_li]:text-yellow-200 [&_strong]:text-yellow-100 [&_em]:text-yellow-200 [&_a]:text-yellow-400">
              <PortableText value={product.description} />
            </div>
          </section>
        )}

        {/* Videos */}
        {product.videos && product.videos.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.videos.map((video: any, idx: number) => (
                <div key={idx} className="bg-black/60 border border-yellow-400/30 rounded-lg p-4">
                  {video.videoType === 'youtube' && video.youtubeId ? (
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtubeId}`}
                        className="w-full h-full rounded"
                        allowFullScreen
                      />
                    </div>
                  ) : video.videoType === 'vimeo' && video.vimeoId ? (
                    <div className="aspect-video">
                      <iframe
                        src={`https://player.vimeo.com/video/${video.vimeoId}`}
                        className="w-full h-full rounded"
                        allowFullScreen
                      />
                    </div>
                  ) : video.videoUrl ? (
                    <video
                      src={video.videoUrl}
                      controls
                      className="w-full rounded"
                      autoPlay={video.autoplay}
                      loop={video.loop}
                      muted={video.muted}
                    />
                  ) : null}
                  {video.title && (
                    <h3 className="text-yellow-100 font-bold mt-2">{video.title}</h3>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Specifications</h2>
            <div className="bg-black/60 border border-yellow-400/30 rounded-lg p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec: any, idx: number) => (
                  <div key={idx} className="border-b border-yellow-400/20 pb-2">
                    <dt className="font-bold text-yellow-400">{spec.name}</dt>
                    <dd className="text-yellow-100">
                      {spec.value} {spec.unit || ''}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {/* Reviews */}
        {approvedReviews.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">
              Reviews ({approvedReviews.length})
            </h2>
            <div className="space-y-6">
              {featuredReviews.length > 0 && (
                <>
                  {featuredReviews.map((review: any, idx: number) => (
                    <ReviewCard key={idx} review={review} />
                  ))}
                </>
              )}
              {approvedReviews.filter((r: any) => !r.isFeatured).map((review: any, idx: number) => (
                <ReviewCard key={idx} review={review} />
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-yellow-400 mb-6">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.relatedProducts.map((related: any) => {
                const relatedImageRef = related.primaryImage?.asset?._ref || related.primaryImage?._ref
                return (
                  <Link
                    key={related._id}
                    href={`/shop/${related.slug}`}
                    className="group bg-black/60 border border-yellow-400/30 hover:border-yellow-400 rounded-lg overflow-hidden transition"
                  >
                    {relatedImageRef && (
                      <div className="aspect-square relative">
                        <SanityImage
                          id={relatedImageRef}
                          width={200}
                          height={200}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          mode="cover"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="text-yellow-100 font-bold text-sm mb-1 line-clamp-2">
                        {related.title}
                      </h3>
                      {related.pricing && (
                        <p className="text-yellow-400 font-bold">
                          ${related.pricing.salePrice || related.pricing.basePrice}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function ReviewCard({review}: {review: any}) {
  return (
    <div className="bg-black/60 border border-yellow-400/30 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-yellow-100">{review.author?.name}</span>
            {review.author?.verifiedPurchase && (
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded">Verified Purchase</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-yellow-400">
                {i < review.rating ? '⭐' : '☆'}
              </span>
            ))}
            {review.date && (
              <span className="text-yellow-200/50 text-sm">
                {new Date(review.date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        {review.isFeatured && (
          <span className="bg-[#FFB81C] text-black px-2 py-1 rounded text-xs font-bold">Featured</span>
        )}
      </div>
      {review.title && (
        <h4 className="font-bold text-yellow-100 mb-2">{review.title}</h4>
      )}
      <p className="text-yellow-200 mb-4">{review.content}</p>
      {review.pros && review.pros.length > 0 && (
        <div className="mb-2">
          <span className="font-bold text-green-400">Pros: </span>
          <span className="text-yellow-200">{review.pros.join(', ')}</span>
        </div>
      )}
      {review.cons && review.cons.length > 0 && (
        <div className="mb-2">
          <span className="font-bold text-red-400">Cons: </span>
          <span className="text-yellow-200">{review.cons.join(', ')}</span>
        </div>
      )}
      {review.response && (
        <div className="mt-4 pt-4 border-t border-yellow-400/20">
          <p className="text-yellow-300 italic">
            <span className="font-bold">Response from merchant:</span> {review.response.content}
          </p>
        </div>
      )}
    </div>
  )
}
