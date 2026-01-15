import {PackageIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'
import {productVariant} from '../objects/productVariant'
import {productReview} from '../objects/productReview'
import {productImage} from '../objects/productImage'
import {productVideo} from '../objects/productVideo'
import {productSpecification} from '../objects/productSpecification'
import {blockContent} from '../objects/blockContent'

/**
 * Product schema
 * Comprehensive product schema for e-commerce
 */
export const product = defineType({
  name: 'product',
  title: 'Product',
  icon: PackageIcon,
  type: 'document',
  fields: [
    // Basic Information
    defineField({
      name: 'title',
      title: 'Product Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly identifier (auto-generated from title)',
      options: {
        source: 'title',
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      description: 'Brief description for product cards and previews (1-2 sentences)',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'description',
      title: 'Full Description',
      type: 'blockContent',
      description: 'Detailed product description with rich text formatting',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Short excerpt for meta descriptions and previews',
    }),

    // Pricing
    defineField({
      name: 'pricing',
      title: 'Pricing',
      type: 'object',
      fields: [
        {
          name: 'basePrice',
          title: 'Base Price',
          type: 'number',
          description: 'Standard price for the product',
          validation: (rule) => rule.required().min(0),
        },
        {
          name: 'salePrice',
          title: 'Sale Price',
          type: 'number',
          description: 'Discounted/sale price (if on sale)',
          validation: (rule) => rule.min(0),
        },
        {
          name: 'compareAtPrice',
          title: 'Compare At Price',
          type: 'number',
          description: 'Original price to show for comparison (e.g., MSRP)',
          validation: (rule) => rule.min(0),
        },
        {
          name: 'currency',
          title: 'Currency',
          type: 'string',
          options: {
            list: [
              {title: 'USD ($)', value: 'USD'},
              {title: 'EUR (€)', value: 'EUR'},
              {title: 'GBP (£)', value: 'GBP'},
              {title: 'CAD ($)', value: 'CAD'},
              {title: 'AUD ($)', value: 'AUD'},
            ],
          },
          initialValue: 'USD',
        },
        {
          name: 'costPerItem',
          title: 'Cost Per Item',
          type: 'number',
          description: 'Internal cost for profit calculations',
          validation: (rule) => rule.min(0),
        },
        {
          name: 'taxable',
          title: 'Taxable',
          type: 'boolean',
          description: 'Product is subject to sales tax',
          initialValue: true,
        },
        {
          name: 'taxCode',
          title: 'Tax Code',
          type: 'string',
          description: 'Tax classification code (if applicable)',
        },
      ],
    }),

    // Media
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      description: 'Gallery of product images',
      of: [{type: 'productImage'}],
      validation: (rule) => rule.min(1).error('At least one product image is required'),
    }),
    defineField({
      name: 'videos',
      title: 'Product Videos',
      type: 'array',
      description: 'Product demonstration videos, tutorials, etc.',
      of: [{type: 'productVideo'}],
    }),

    // Variants
    defineField({
      name: 'variants',
      title: 'Product Variants',
      type: 'array',
      description: 'Different variations of this product (size, color, material, etc.)',
      of: [{type: 'productVariant'}],
    }),
    defineField({
      name: 'variantOptions',
      title: 'Variant Options',
      type: 'object',
      description: 'Define what types of variants are available for this product',
      fields: [
        {
          name: 'hasVariants',
          title: 'Has Variants',
          type: 'boolean',
          description: 'Enable variant selection for this product',
          initialValue: false,
        },
        {
          name: 'optionTypes',
          title: 'Option Types',
          type: 'array',
          description: 'Types of options available (e.g., Size, Color, Material)',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'name',
                  title: 'Option Name',
                  type: 'string',
                  description: 'e.g., "Size", "Color", "Material"',
                  validation: (rule) => rule.required(),
                },
                {
                  name: 'values',
                  title: 'Option Values',
                  type: 'array',
                  description: 'Available values for this option',
                  of: [{type: 'string'}],
                  validation: (rule) => rule.min(1),
                },
              ],
              preview: {
                select: {
                  name: 'name',
                  values: 'values',
                },
                prepare({name, values}) {
                  return {
                    title: name,
                    subtitle: values?.join(', ') || 'No values',
                  }
                },
              },
            },
          ],
        },
      ],
    }),

    // Inventory
    defineField({
      name: 'inventory',
      title: 'Inventory Management',
      type: 'object',
      fields: [
        {
          name: 'trackInventory',
          title: 'Track Inventory',
          type: 'boolean',
          description: 'Enable inventory tracking',
          initialValue: true,
        },
        {
          name: 'quantity',
          title: 'Total Quantity',
          type: 'number',
          description: 'Total available quantity (if not using variants)',
          initialValue: 0,
          validation: (rule) => rule.min(0).integer(),
        },
        {
          name: 'lowStockThreshold',
          title: 'Low Stock Threshold',
          type: 'number',
          description: 'Alert when stock falls below this number',
          initialValue: 10,
          validation: (rule) => rule.min(0).integer(),
        },
        {
          name: 'allowBackorder',
          title: 'Allow Backorder',
          type: 'boolean',
          description: 'Allow purchases when out of stock',
          initialValue: false,
        },
        {
          name: 'sku',
          title: 'SKU',
          type: 'string',
          description: 'Stock Keeping Unit (if no variants)',
        },
        {
          name: 'barcode',
          title: 'Barcode',
          type: 'string',
          description: 'Product barcode (UPC, EAN, etc.)',
        },
      ],
    }),

    // Shipping
    defineField({
      name: 'shipping',
      title: 'Shipping Information',
      type: 'object',
      fields: [
        {
          name: 'weight',
          title: 'Weight',
          type: 'object',
          fields: [
            {
              name: 'value',
              title: 'Weight Value',
              type: 'number',
              validation: (rule) => rule.min(0),
            },
            {
              name: 'unit',
              title: 'Weight Unit',
              type: 'string',
              options: {
                list: [
                  {title: 'Pounds (lbs)', value: 'lbs'},
                  {title: 'Kilograms (kg)', value: 'kg'},
                  {title: 'Ounces (oz)', value: 'oz'},
                  {title: 'Grams (g)', value: 'g'},
                ],
              },
              initialValue: 'lbs',
            },
          ],
        },
        {
          name: 'dimensions',
          title: 'Dimensions',
          type: 'object',
          fields: [
            {
              name: 'length',
              title: 'Length',
              type: 'number',
              validation: (rule) => rule.min(0),
            },
            {
              name: 'width',
              title: 'Width',
              type: 'number',
              validation: (rule) => rule.min(0),
            },
            {
              name: 'height',
              title: 'Height',
              type: 'number',
              validation: (rule) => rule.min(0),
            },
            {
              name: 'unit',
              title: 'Unit',
              type: 'string',
              options: {
                list: [
                  {title: 'Inches (in)', value: 'in'},
                  {title: 'Centimeters (cm)', value: 'cm'},
                  {title: 'Feet (ft)', value: 'ft'},
                  {title: 'Meters (m)', value: 'm'},
                ],
              },
              initialValue: 'in',
            },
          ],
        },
        {
          name: 'requiresShipping',
          title: 'Requires Shipping',
          type: 'boolean',
          description: 'Product requires physical shipping',
          initialValue: true,
        },
        {
          name: 'shippingClass',
          title: 'Shipping Class',
          type: 'string',
          description: 'Shipping category (e.g., "Standard", "Express", "Oversized")',
        },
        {
          name: 'freeShipping',
          title: 'Free Shipping',
          type: 'boolean',
          description: 'Offer free shipping for this product',
          initialValue: false,
        },
      ],
    }),

    // Specifications
    defineField({
      name: 'specifications',
      title: 'Product Specifications',
      type: 'array',
      description: 'Technical specifications and product details',
      of: [{type: 'productSpecification'}],
    }),

    // Reviews
    defineField({
      name: 'reviews',
      title: 'Product Reviews',
      type: 'array',
      description: 'Customer reviews and ratings',
      of: [{type: 'productReview'}],
    }),
    defineField({
      name: 'averageRating',
      title: 'Average Rating',
      type: 'number',
      description: 'Calculated average rating (1-5 stars)',
      readOnly: true,
      validation: (rule) => rule.min(1).max(5),
    }),
    defineField({
      name: 'reviewCount',
      title: 'Review Count',
      type: 'number',
      description: 'Total number of reviews',
      readOnly: true,
      validation: (rule) => rule.min(0).integer(),
    }),

    // Categories & Tags
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      description: 'Product categories',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      description: 'Product tags for filtering and search',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      description: 'Product brand or manufacturer',
    }),
    defineField({
      name: 'collection',
      title: 'Collection',
      type: 'string',
      description: 'Product collection or series',
    }),

    // SEO
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'SEO title (if different from product title)',
          validation: (rule) => rule.max(60),
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'SEO meta description',
          validation: (rule) => rule.max(160),
        },
        {
          name: 'keywords',
          title: 'Keywords',
          type: 'array',
          description: 'SEO keywords',
          of: [{type: 'string'}],
        },
        {
          name: 'ogImage',
          title: 'Open Graph Image',
          type: 'image',
          description: 'Image for social media sharing',
          options: {
            hotspot: true,
          },
        },
      ],
    }),

    // Status & Visibility
    defineField({
      name: 'status',
      title: 'Product Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Active', value: 'active'},
          {title: 'Out of Stock', value: 'out_of_stock'},
          {title: 'Discontinued', value: 'discontinued'},
          {title: 'Archived', value: 'archived'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Product',
      type: 'boolean',
      description: 'Show this product prominently',
      initialValue: false,
    }),
    defineField({
      name: 'isNew',
      title: 'New Product',
      type: 'boolean',
      description: 'Mark as new product',
      initialValue: false,
    }),
    defineField({
      name: 'isOnSale',
      title: 'On Sale',
      type: 'boolean',
      description: 'Product is currently on sale',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When the product was published',
      initialValue: () => new Date().toISOString(),
    }),

    // Related Products
    defineField({
      name: 'relatedProducts',
      title: 'Related Products',
      type: 'array',
      description: 'Products related to this one',
      of: [
        {
          type: 'reference',
          to: [{type: 'product'}],
        },
      ],
    }),
    defineField({
      name: 'upsellProducts',
      title: 'Upsell Products',
      type: 'array',
      description: 'Products to suggest as upgrades or add-ons',
      of: [
        {
          type: 'reference',
          to: [{type: 'product'}],
        },
      ],
    }),

    // Additional Information
    defineField({
      name: 'warranty',
      title: 'Warranty Information',
      type: 'object',
      fields: [
        {
          name: 'hasWarranty',
          title: 'Has Warranty',
          type: 'boolean',
          initialValue: false,
        },
        {
          name: 'warrantyPeriod',
          title: 'Warranty Period',
          type: 'string',
          description: 'e.g., "1 year", "90 days", "Lifetime"',
        },
        {
          name: 'warrantyDescription',
          title: 'Warranty Description',
          type: 'text',
        },
      ],
    }),
    defineField({
      name: 'careInstructions',
      title: 'Care Instructions',
      type: 'text',
      description: 'How to care for/maintain this product',
    }),
    defineField({
      name: 'notes',
      title: 'Internal Notes',
      type: 'text',
      description: 'Private notes for internal use (not visible to customers)',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'images.0.image',
      status: 'status',
      price: 'pricing.basePrice',
      salePrice: 'pricing.salePrice',
      currency: 'pricing.currency',
      featured: 'isFeatured',
    },
    prepare({title, media, status, price, salePrice, currency, featured}) {
      const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'
      const priceDisplay = salePrice
        ? `${currencySymbol}${salePrice} (was ${currencySymbol}${price})`
        : `${currencySymbol}${price || '0'}`
      const statusEmoji =
        status === 'active'
          ? '✅'
          : status === 'draft'
            ? '📝'
            : status === 'out_of_stock'
              ? '❌'
              : status === 'discontinued'
                ? '🚫'
                : '📦'
      const featuredBadge = featured ? '⭐ ' : ''

      return {
        title: `${featuredBadge}${title}`,
        subtitle: `${statusEmoji} ${status || 'draft'} • ${priceDisplay}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
    {
      title: 'Title Z-A',
      name: 'titleDesc',
      by: [{field: 'title', direction: 'desc'}],
    },
    {
      title: 'Price Low-High',
      name: 'priceAsc',
      by: [{field: 'pricing.basePrice', direction: 'asc'}],
    },
    {
      title: 'Price High-Low',
      name: 'priceDesc',
      by: [{field: 'pricing.basePrice', direction: 'desc'}],
    },
    {
      title: 'Newest First',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Oldest First',
      name: 'publishedAtAsc',
      by: [{field: 'publishedAt', direction: 'asc'}],
    },
  ],
})
