import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

const postFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "post": post->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[_type == "page" || _type == "post" && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const allPostsQuery = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${postFields}
  }
`)

export const morePostsQuery = defineQuery(`
  *[_type == "post" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${postFields}
  }
`)

export const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${postFields}
  }
`)

export const postPagesSlugs = defineQuery(`
  *[_type == "post" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)

const productFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  shortDescription,
  description,
  excerpt,
  "primaryImage": coalesce(images[isPrimary == true][0].image, null),
  "thumbnailImage": coalesce(images[isThumbnail == true][0].image, null),
  "firstImage": coalesce(images[0].image, null),
  images[]{
    image,
    alt,
    caption,
    isPrimary,
    isThumbnail
  },
  pricing{
    basePrice,
    salePrice,
    compareAtPrice,
    currency
  },
  status,
  isFeatured,
  isNew,
  isOnSale,
  publishedAt,
  categories,
  tags,
  brand,
  collection,
  "averageRating": coalesce(averageRating, 0),
  "reviewCount": coalesce(reviewCount, 0)
`

export const allProductsQuery = defineQuery(`
  *[_type == "product" && defined(slug.current) && defined(title) && (!defined(status) || (status != "discontinued" && status != "archived"))] | order(publishedAt desc, _updatedAt desc) {
    ${productFields}
  }
`)

export const productQuery = defineQuery(`
  *[_type == "product" && slug.current == $slug][0] {
    ${productFields},
    videos[]{
      title,
      videoType,
      videoFile,
      youtubeId,
      vimeoId,
      videoUrl,
      thumbnail,
      duration,
      isPrimary,
      autoplay,
      loop,
      muted
    },
    variants[]{
      name,
      sku,
      options[]{
        optionType,
        optionValue
      },
      price,
      salePrice,
      inventory{
        quantity,
        trackInventory,
        allowBackorder,
        lowStockThreshold
      },
      weight{
        value,
        unit
      },
      dimensions{
        length,
        width,
        height,
        unit
      },
      image,
      isDefault,
      isActive
    },
    variantOptions{
      hasVariants,
      optionTypes[]{
        name,
        values
      }
    },
    inventory{
      trackInventory,
      quantity,
      lowStockThreshold,
      allowBackorder,
      sku,
      barcode
    },
    shipping{
      weight{
        value,
        unit
      },
      dimensions{
        length,
        width,
        height,
        unit
      },
      requiresShipping,
      shippingClass,
      freeShipping
    },
    specifications[]{
      name,
      value,
      unit,
      group,
      order
    },
    reviews[]{
      author{
        name,
        email,
        verifiedPurchase,
        location
      },
      rating,
      title,
      content,
      pros,
      cons,
      images[]{
        image,
        alt
      },
      date,
      helpful,
      isApproved,
      isFeatured,
      response{
        content,
        date,
        author
      }
    },
    seo{
      metaTitle,
      metaDescription,
      keywords,
      ogImage
    },
    relatedProducts[]->{
      title,
      "slug": slug.current,
      "primaryImage": images[isPrimary == true][0].image,
      pricing{
        basePrice,
        salePrice,
        currency
      }
    },
    upsellProducts[]->{
      title,
      "slug": slug.current,
      "primaryImage": images[isPrimary == true][0].image,
      pricing{
        basePrice,
        salePrice,
        currency
      }
    },
    warranty{
      hasWarranty,
      warrantyPeriod,
      warrantyDescription
    },
    careInstructions,
    notes
  }
`)

export const productSlugs = defineQuery(`
  *[_type == "product" && defined(slug.current)]
  {"slug": slug.current}
`)
