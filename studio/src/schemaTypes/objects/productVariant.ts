import {defineField, defineType} from 'sanity'

/**
 * Product Variant schema
 * Used to define different variations of a product (size, color, material, etc.)
 */
export const productVariant = defineType({
  name: 'productVariant',
  title: 'Product Variant',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Variant Name',
      type: 'string',
      description: 'e.g., "Small - Red", "Large - Blue", "Steel - Black"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sku',
      title: 'SKU',
      type: 'string',
      description: 'Stock Keeping Unit - unique identifier for this variant',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'options',
      title: 'Variant Options',
      type: 'array',
      description: 'The specific options that make up this variant',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'optionType',
              title: 'Option Type',
              type: 'string',
              description: 'e.g., "Size", "Color", "Material", "Finish"',
              validation: (rule) => rule.required(),
            },
            {
              name: 'optionValue',
              title: 'Option Value',
              type: 'string',
              description: 'e.g., "Small", "Red", "Steel", "Matte"',
              validation: (rule) => rule.required(),
            },
          ],
          preview: {
            select: {
              type: 'optionType',
              value: 'optionValue',
            },
            prepare({type, value}) {
              return {
                title: `${type}: ${value}`,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      description: 'Price for this specific variant (overrides base product price)',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'salePrice',
      title: 'Sale Price',
      type: 'number',
      description: 'Sale/discounted price for this variant',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'inventory',
      title: 'Inventory',
      type: 'object',
      fields: [
        {
          name: 'quantity',
          title: 'Quantity',
          type: 'number',
          description: 'Available quantity in stock',
          initialValue: 0,
          validation: (rule) => rule.min(0).integer(),
        },
        {
          name: 'trackInventory',
          title: 'Track Inventory',
          type: 'boolean',
          description: 'Enable inventory tracking for this variant',
          initialValue: true,
        },
        {
          name: 'allowBackorder',
          title: 'Allow Backorder',
          type: 'boolean',
          description: 'Allow purchases when out of stock',
          initialValue: false,
        },
        {
          name: 'lowStockThreshold',
          title: 'Low Stock Threshold',
          type: 'number',
          description: 'Alert when stock falls below this number',
          initialValue: 10,
          validation: (rule) => rule.min(0).integer(),
        },
      ],
    }),
    defineField({
      name: 'weight',
      title: 'Weight',
      type: 'object',
      description: 'Weight and dimensions for shipping calculations',
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
    }),
    defineField({
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
    }),
    defineField({
      name: 'image',
      title: 'Variant Image',
      type: 'image',
      description: 'Specific image for this variant (optional)',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative text',
        },
      ],
    }),
    defineField({
      name: 'isDefault',
      title: 'Default Variant',
      type: 'boolean',
      description: 'Mark this as the default variant shown on product page',
      initialValue: false,
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Show/hide this variant',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'name',
      sku: 'sku',
      media: 'image',
      price: 'price',
      salePrice: 'salePrice',
    },
    prepare({title, sku, media, price, salePrice}) {
      const priceDisplay = salePrice ? `$${salePrice} (was $${price})` : `$${price || 'N/A'}`
      return {
        title: title || 'Unnamed Variant',
        subtitle: `${sku || 'No SKU'} - ${priceDisplay}`,
        media,
      }
    },
  },
})
